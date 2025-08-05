const asyncHandler = require('express-async-handler');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// @desc Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);

  if (existingUser.rows.length > 0) {
    res.status(400);
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await db.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, email, hashedPassword]
  );

  const user = newUser.rows[0];

  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    token: generateToken(user.id),
  });
});

// @desc Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc Forgot Password - Send Reset Link
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const token = crypto.randomBytes(32).toString('hex');

  await db.query(
    'UPDATE users SET reset_token = $1, reset_token_expiry = NOW() + INTERVAL \'1 hour\' WHERE id = $2',
    [token, user.id]
  );

  const resetLink = `http://localhost:3000/reset-password/${token}`;
  await sendEmail(user.email, 'Password Reset Request', `Reset your password using this link: ${resetLink}`);

  res.json({ message: 'Password reset link sent' });
});

// @desc Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const token = req.params.token;

  const result = await db.query(
    'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
    [token]
  );

  const user = result.rows[0];

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await db.query(
    'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
    [hashedPassword, user.id]
  );

  res.json({ message: 'Password has been reset successfully' });
});



module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  
};
