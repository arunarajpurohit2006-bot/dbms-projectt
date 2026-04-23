// ============================================================
// controllers/bookController.js
// CRUD operations for books (admin: full access, student: read)
// ============================================================

const BookModel = require('../models/bookModel');

// ---- GET ALL BOOKS -----------------------------------------
// GET /api/books?search=&genre=
const getBooks = async (req, res, next) => {
    try {
        const { search, genre } = req.query;
        const books = await BookModel.getAll(search, genre);
        res.json(books);
    } catch (err) {
        next(err);
    }
};

// ---- GET SINGLE BOOK ---------------------------------------
// GET /api/books/:id
const getBook = async (req, res, next) => {
    try {
        const book = await BookModel.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found.' });
        res.json(book);
    } catch (err) {
        next(err);
    }
};

// ---- ADD BOOK (admin only) ---------------------------------
// POST /api/books
const addBook = async (req, res, next) => {
    try {
        const { title, author, isbn, genre, publisher, publish_year, total_copies, shelf_location } = req.body;

        // Validate required fields
        if (!title || !author || !isbn) {
            return res.status(400).json({ message: 'Title, author, and ISBN are required.' });
        }

        const book = await BookModel.create({
            title, author, isbn, genre, publisher,
            publish_year: publish_year || null,
            total_copies: total_copies || 1,
            shelf_location
        });

        res.status(201).json({ message: 'Book added successfully!', book });
    } catch (err) {
        next(err);
    }
};

// ---- UPDATE BOOK (admin only) ------------------------------
// PUT /api/books/:id
const updateBook = async (req, res, next) => {
    try {
        const book = await BookModel.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found.' });

        const updated = await BookModel.update(req.params.id, req.body);
        res.json({ message: 'Book updated successfully!', book: updated });
    } catch (err) {
        next(err);
    }
};

// ---- DELETE BOOK (admin only) ------------------------------
// DELETE /api/books/:id
const deleteBook = async (req, res, next) => {
    try {
        const book = await BookModel.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found.' });

        // Prevent deletion if copies are currently issued
        if (book.available_copies < book.total_copies) {
            return res.status(400).json({
                message: 'Cannot delete book. Some copies are currently issued.'
            });
        }

        await BookModel.delete(req.params.id);
        res.json({ message: 'Book deleted successfully.' });
    } catch (err) {
        next(err);
    }
};

// ---- GET GENRES --------------------------------------------
// GET /api/books/genres
const getGenres = async (req, res, next) => {
    try {
        const genres = await BookModel.getGenres();
        res.json(genres);
    } catch (err) {
        next(err);
    }
};

// ---- GET DASHBOARD STATS (admin) ---------------------------
// GET /api/books/stats
const getStats = async (req, res, next) => {
    try {
        const stats = await BookModel.getStats();
        res.json(stats);
    } catch (err) {
        next(err);
    }
};

module.exports = { getBooks, getBook, addBook, updateBook, deleteBook, getGenres, getStats };
