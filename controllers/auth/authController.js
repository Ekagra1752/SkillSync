const pool = require('../../config/db');

// Controller to handle user registration
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Basic input validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (err) {
    // Check for unique constraint violation (duplicate email)
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }

    console.error('Error registering user:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  registerUser,
};
