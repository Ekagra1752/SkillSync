const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
} = require('../controllers/usersController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); // ✅ PUT added

module.exports = router;
