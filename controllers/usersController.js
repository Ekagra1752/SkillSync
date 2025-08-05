const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get profile
const getUserProfile = async (req, res) => {
  try {
    const query = 'SELECT id, name, email FROM users WHERE id = $1';
    const result = await db.query(query, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update profile
const updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const newName = name || user.name;
    const newEmail = email || user.email;
    const newPassword = password
      ? await bcrypt.hash(password, 10)
      : user.password;

    const updateQuery = 'UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, name, email';
    const updated = await db.query(updateQuery, [newName, newEmail, newPassword, req.user.id]);

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
