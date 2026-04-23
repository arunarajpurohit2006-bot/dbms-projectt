// ============================================================
// controllers/transactionController.js
// Business logic for issuing and returning books
// ============================================================

const TransactionModel = require('../models/transactionModel');
const BookModel        = require('../models/bookModel');
const ReservationModel = require('../models/reservationModel');

// ---- ISSUE BOOK --------------------------------------------
// POST /api/transactions/issue
const issueBook = async (req, res, next) => {
    try {
        const { book_id, user_id } = req.body;

        // Admin can issue to any student; student can issue for themselves
        const targetUserId = req.user.role === 'admin' ? (user_id || req.user.user_id) : req.user.user_id;

        // 1. Check book exists
        const book = await BookModel.findById(book_id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        // 2. Check if student already has this book issued
        const existing = await TransactionModel.findActiveByUserAndBook(targetUserId, book_id);
        if (existing) {
            return res.status(400).json({ message: 'You already have this book issued.' });
        }

        // 3. Check student issue limit (max 3 books at a time)
        const activeCount = await TransactionModel.countActiveByUser(targetUserId);
        if (activeCount >= 3) {
            return res.status(400).json({ message: 'Issue limit reached. Max 3 books allowed at a time.' });
        }

        // 4. Check availability and decrease count atomically
        const updatedBook = await BookModel.decreaseAvailability(book_id);
        if (!updatedBook) {
            return res.status(400).json({ message: 'No copies available. You can reserve this book.' });
        }

        // 5. Create transaction record
        const transaction = await TransactionModel.issueBook(targetUserId, book_id);

        // 6. If there was a reservation, mark it fulfilled
        await ReservationModel.fulfill(targetUserId, book_id);

        res.status(201).json({
            message: 'Book issued successfully!',
            transaction: {
                ...transaction,
                book_title: book.title,
                book_author: book.author
            }
        });
    } catch (err) {
        next(err);
    }
};

// ---- RETURN BOOK -------------------------------------------
// POST /api/transactions/return
const returnBook = async (req, res, next) => {
    try {
        const { transaction_id } = req.body;

        // 1. Find the transaction
        const transaction = await TransactionModel.findById(transaction_id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        // 2. Ensure the transaction is still active
        if (transaction.status !== 'issued') {
            return res.status(400).json({ message: 'This book has already been returned.' });
        }

        // 3. Ensure students can only return their own books
        if (req.user.role === 'student' && transaction.user_id !== req.user.user_id) {
            return res.status(403).json({ message: 'You can only return your own books.' });
        }

        // 4. Update transaction (mark returned, calculate fine)
        const updated = await TransactionModel.returnBook(transaction_id);

        // 5. Increase available copies back
        await BookModel.increaseAvailability(transaction.book_id);

        res.json({
            message: 'Book returned successfully!',
            transaction: updated,
            fine: updated.fine_amount > 0 ? `Fine: ₹${updated.fine_amount}` : 'No fine.'
        });
    } catch (err) {
        next(err);
    }
};

// ---- GET ALL TRANSACTIONS (admin) --------------------------
// GET /api/transactions
const getAllTransactions = async (req, res, next) => {
    try {
        const transactions = await TransactionModel.getAll();
        res.json(transactions);
    } catch (err) {
        next(err);
    }
};

// ---- GET MY TRANSACTIONS (student) -------------------------
// GET /api/transactions/my
const getMyTransactions = async (req, res, next) => {
    try {
        const transactions = await TransactionModel.getByUser(req.user.user_id);
        res.json(transactions);
    } catch (err) {
        next(err);
    }
};

// ---- GET OVERDUE BOOKS (admin) -----------------------------
// GET /api/transactions/overdue
const getOverdue = async (req, res, next) => {
    try {
        const overdue = await TransactionModel.getOverdue();
        res.json(overdue);
    } catch (err) {
        next(err);
    }
};

// ---- GET TRANSACTION STATS (admin) -------------------------
// GET /api/transactions/stats
const getStats = async (req, res, next) => {
    try {
        const stats = await TransactionModel.getStats();
        res.json(stats);
    } catch (err) {
        next(err);
    }
};

module.exports = { issueBook, returnBook, getAllTransactions, getMyTransactions, getOverdue, getStats };
