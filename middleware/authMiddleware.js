const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userQuery = 'SELECT id FROM users WHERE id = $1';
      const result = await db.query(userQuery, [decoded.id]);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Not authorized' });
      }

      req.user = result.rows[0];
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ error: 'No token provided' });
  }
};

module.exports = { protect };
