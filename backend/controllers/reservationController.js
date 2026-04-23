// ============================================================
// controllers/reservationController.js
// Manage book reservations
// ============================================================

const ReservationModel = require('../models/reservationModel');
const BookModel        = require('../models/bookModel');

// ---- RESERVE A BOOK ----------------------------------------
// POST /api/reservations
const reserveBook = async (req, res, next) => {
    try {
        const { book_id } = req.body;
        const user_id = req.user.user_id;

        // 1. Check book exists
        const book = await BookModel.findById(book_id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        // 2. If book is available, just tell them to issue it instead
        if (book.available_copies > 0) {
            return res.status(400).json({ message: 'Book is available. Please issue it directly.' });
        }

        // 3. Check for duplicate reservation
        const existing = await ReservationModel.findActive(user_id, book_id);
        if (existing) {
            return res.status(400).json({ message: 'You already have an active reservation for this book.' });
        }

        // 4. Create reservation
        const reservation = await ReservationModel.create(user_id, book_id);

        res.status(201).json({
            message: 'Book reserved successfully! You will be notified when it is available.',
            reservation: {
                ...reservation,
                book_title: book.title
            }
        });
    } catch (err) {
        next(err);
    }
};

// ---- CANCEL RESERVATION ------------------------------------
// PUT /api/reservations/:id/cancel
const cancelReservation = async (req, res, next) => {
    try {
        const cancelled = await ReservationModel.cancel(req.params.id, req.user.user_id);
        if (!cancelled) {
            return res.status(404).json({ message: 'Reservation not found or already closed.' });
        }
        res.json({ message: 'Reservation cancelled.', reservation: cancelled });
    } catch (err) {
        next(err);
    }
};

// ---- GET ALL RESERVATIONS (admin) --------------------------
// GET /api/reservations
const getAllReservations = async (req, res, next) => {
    try {
        const reservations = await ReservationModel.getAll();
        res.json(reservations);
    } catch (err) {
        next(err);
    }
};

// ---- GET MY RESERVATIONS (student) -------------------------
// GET /api/reservations/my
const getMyReservations = async (req, res, next) => {
    try {
        const reservations = await ReservationModel.getByUser(req.user.user_id);
        res.json(reservations);
    } catch (err) {
        next(err);
    }
};

module.exports = { reserveBook, cancelReservation, getAllReservations, getMyReservations };
