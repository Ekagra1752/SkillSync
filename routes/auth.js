const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// No need to import authMiddleware or deleteUser now

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// 👇 DELETE route removed

module.exports = router;
