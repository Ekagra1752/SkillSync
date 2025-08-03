const express = require('express');
const router = express.Router();
const { registerUser } = require('../../controllers/auth/authController');

// POST /api/auth/register
router.post('/register', registerUser);

module.exports = router;
