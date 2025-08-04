const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const checkQuery = 'SELECT * FROM users WHERE email = $1';
    const checkResult = await db.query(checkQuery, [email]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const insertQuery =
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *';
    const newUser = await db.query(insertQuery, [name, email, hashedPassword]);

    const token = generateToken(newUser.rows[0].id);

    res.status(201).json({
      id: newUser.rows[0].id,
      name: newUser.rows[0].name,
      email: newUser.rows[0].email,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await db.query(userQuery, [email]);

    if (
      userResult.rows.length === 0 ||
      !(await bcrypt.compare(password, userResult.rows[0].password))
    ) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(userResult.rows[0].id);

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    const userQuery = 'SELECT id, name, email FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [req.user.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ✅ @desc    Update user profile
// ✅ @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [req.user.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    const newName = name || user.name;
    const newEmail = email || user.email;
    const newPassword = password
      ? await bcrypt.hash(password, 10)
      : user.password;

    const updateQuery =
      'UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, name, email';
    const updatedUser = await db.query(updateQuery, [
      newName,
      newEmail,
      newPassword,
      req.user.id,
    ]);

    res.json(updatedUser.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
