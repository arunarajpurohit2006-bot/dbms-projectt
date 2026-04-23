// ============================================================
// routes/transactionRoutes.js
// ============================================================

const express = require('express');
const router  = express.Router();
const {
    issueBook, returnBook, getAllTransactions, getMyTransactions, getOverdue, getStats
} = require('../controllers/transactionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/issue',    protect, issueBook);               // Admin + Student
router.post('/return',   protect, returnBook);              // Admin + Student
router.get('/my',        protect, getMyTransactions);       // Student's own records
router.get('/overdue',   protect, adminOnly, getOverdue);   // Admin only
router.get('/stats',     protect, adminOnly, getStats);     // Admin only
router.get('/',          protect, adminOnly, getAllTransactions); // Admin only

module.exports = router;
