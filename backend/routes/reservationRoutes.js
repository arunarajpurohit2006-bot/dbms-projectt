// ============================================================
// routes/reservationRoutes.js
// ============================================================

const express = require('express');
const router  = express.Router();
const {
    reserveBook, cancelReservation, getAllReservations, getMyReservations
} = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/',              protect, reserveBook);              // Student
router.put('/:id/cancel',     protect, cancelReservation);        // Student (own)
router.get('/my',             protect, getMyReservations);        // Student
router.get('/',               protect, adminOnly, getAllReservations); // Admin

module.exports = router;
