// ============================================================
// models/bookModel.js
// All SQL queries related to the 'books' table
// ============================================================

const { query } = require('../config/db');

const BookModel = {

    // Get all books with optional search/filter
    getAll: async (search = '', genre = '') => {
        let sql = `
            SELECT book_id, title, author, isbn, genre, publisher,
                   publish_year, total_copies, available_copies, shelf_location, added_at
            FROM books
            WHERE 1=1
        `;
        const params = [];

        // Dynamic search filter
        if (search) {
            params.push(`%${search}%`);
            sql += ` AND (title ILIKE $${params.length} OR author ILIKE $${params.length} OR isbn ILIKE $${params.length})`;
        }

        if (genre) {
            params.push(genre);
            sql += ` AND genre = $${params.length}`;
        }

        sql += ' ORDER BY title ASC';
        const result = await query(sql, params);
        return result.rows;
    },

    // Get a single book by ID
    findById: async (book_id) => {
        const sql = 'SELECT * FROM books WHERE book_id = $1';
        const result = await query(sql, [book_id]);
        return result.rows[0];
    },

    // Add a new book
    create: async ({ title, author, isbn, genre, publisher, publish_year, total_copies, shelf_location }) => {
        const sql = `
            INSERT INTO books (title, author, isbn, genre, publisher, publish_year, total_copies, available_copies, shelf_location)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)
            RETURNING *
        `;
        // Note: available_copies starts equal to total_copies ($7 used twice)
        const result = await query(sql, [title, author, isbn, genre, publisher, publish_year, total_copies, shelf_location]);
        return result.rows[0];
    },

    // Update book information
    update: async (book_id, { title, author, genre, publisher, publish_year, total_copies, shelf_location }) => {
        const sql = `
            UPDATE books
            SET title = $1, author = $2, genre = $3, publisher = $4,
                publish_year = $5, total_copies = $6, shelf_location = $7
            WHERE book_id = $8
            RETURNING *
        `;
        const result = await query(sql, [title, author, genre, publisher, publish_year, total_copies, shelf_location, book_id]);
        return result.rows[0];
    },

    // Delete a book (only if no active issues)
    delete: async (book_id) => {
        const sql = 'DELETE FROM books WHERE book_id = $1 RETURNING *';
        const result = await query(sql, [book_id]);
        return result.rows[0];
    },

    // Decrease available copies by 1 (when book is issued)
    decreaseAvailability: async (book_id) => {
        const sql = `
            UPDATE books SET available_copies = available_copies - 1
            WHERE book_id = $1 AND available_copies > 0
            RETURNING *
        `;
        const result = await query(sql, [book_id]);
        return result.rows[0]; // returns undefined if no copies available
    },

    // Increase available copies by 1 (when book is returned)
    increaseAvailability: async (book_id) => {
        const sql = `
            UPDATE books SET available_copies = available_copies + 1
            WHERE book_id = $1
            RETURNING *
        `;
        const result = await query(sql, [book_id]);
        return result.rows[0];
    },

    // Get distinct genres for filter dropdown
    getGenres: async () => {
        const result = await query('SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL ORDER BY genre');
        return result.rows.map(r => r.genre);
    },

    // Get statistics for admin dashboard
    getStats: async () => {
        const result = await query(`
            SELECT
                COUNT(*) AS total_books,
                SUM(total_copies) AS total_copies,
                SUM(available_copies) AS available_copies,
                SUM(total_copies - available_copies) AS issued_copies
            FROM books
        `);
        return result.rows[0];
    }
};

module.exports = BookModel;
