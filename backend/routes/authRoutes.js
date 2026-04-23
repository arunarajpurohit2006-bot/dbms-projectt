// ============================================================
// routes/authRoutes.js
// ============================================================

const express = require('express');
const router  = express.Router();
const { register, login, getProfile, getStudents } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register',  register);              // Public
router.post('/login',     login);                 // Public
router.get('/me',         protect, getProfile);   // Logged in users
router.get('/students',   protect, adminOnly, getStudents); // Admin only

module.exports = router;
