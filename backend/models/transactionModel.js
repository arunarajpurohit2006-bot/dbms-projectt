// ============================================================
// models/transactionModel.js
// SQL queries for book issue/return transactions
// ============================================================

const { query } = require('../config/db');

const TransactionModel = {

    // Issue a book to a student
    issueBook: async (user_id, book_id) => {
        const sql = `
            INSERT INTO transactions (user_id, book_id, issue_date, due_date, status)
            VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', 'issued')
            RETURNING *
        `;
        const result = await query(sql, [user_id, book_id]);
        return result.rows[0];
    },

    // Return a book - calculates fine if overdue
    returnBook: async (transaction_id) => {
        const FINE_PER_DAY = parseFloat(process.env.FINE_PER_DAY) || 2;

        const sql = `
            UPDATE transactions
            SET
                return_date  = CURRENT_DATE,
                status       = 'returned',
                -- Fine = days overdue × fine_per_day (minimum 0)
                fine_amount  = GREATEST(0, (CURRENT_DATE - due_date)) * $1
            WHERE transaction_id = $2 AND status = 'issued'
            RETURNING *
        `;
        const result = await query(sql, [FINE_PER_DAY, transaction_id]);
        return result.rows[0];
    },

    // Get all transactions (admin view) with user and book details
    getAll: async () => {
        const sql = `
            SELECT
                t.transaction_id,
                u.name        AS student_name,
                u.email       AS student_email,
                b.title       AS book_title,
                b.author      AS book_author,
                t.issue_date,
                t.due_date,
                t.return_date,
                t.status,
                t.fine_amount
            FROM transactions t
            JOIN users u ON t.user_id = u.user_id
            JOIN books b ON t.book_id = b.book_id
            ORDER BY t.created_at DESC
        `;
        const result = await query(sql);
        return result.rows;
    },

    // Get transactions for a specific student
    getByUser: async (user_id) => {
        const sql = `
            SELECT
                t.transaction_id,
                b.title       AS book_title,
                b.author      AS book_author,
                b.isbn,
                t.issue_date,
                t.due_date,
                t.return_date,
                t.status,
                t.fine_amount
            FROM transactions t
            JOIN books b ON t.book_id = b.book_id
            WHERE t.user_id = $1
            ORDER BY t.created_at DESC
        `;
        const result = await query(sql, [user_id]);
        return result.rows;
    },

    // Find a specific active (issued) transaction
    findActiveByUserAndBook: async (user_id, book_id) => {
        const sql = `
            SELECT * FROM transactions
            WHERE user_id = $1 AND book_id = $2 AND status = 'issued'
        `;
        const result = await query(sql, [user_id, book_id]);
        return result.rows[0];
    },

    // Find transaction by ID
    findById: async (transaction_id) => {
        const sql = 'SELECT * FROM transactions WHERE transaction_id = $1';
        const result = await query(sql, [transaction_id]);
        return result.rows[0];
    },

    // Check how many books a student currently has issued
    countActiveByUser: async (user_id) => {
        const result = await query(
            "SELECT COUNT(*) FROM transactions WHERE user_id = $1 AND status = 'issued'",
            [user_id]
        );
        return parseInt(result.rows[0].count);
    },

    // Get overdue transactions (for admin)
    getOverdue: async () => {
        const sql = `
            SELECT
                t.transaction_id,
                u.name        AS student_name,
                u.email       AS student_email,
                u.phone,
                b.title       AS book_title,
                t.issue_date,
                t.due_date,
                (CURRENT_DATE - t.due_date) AS days_overdue,
                (CURRENT_DATE - t.due_date) * ${process.env.FINE_PER_DAY || 2} AS estimated_fine
            FROM transactions t
            JOIN users u ON t.user_id = u.user_id
            JOIN books b ON t.book_id = b.book_id
            WHERE t.status = 'issued' AND t.due_date < CURRENT_DATE
            ORDER BY t.due_date ASC
        `;
        const result = await query(sql);
        return result.rows;
    },

    // Dashboard stats
    getStats: async () => {
        const result = await query(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'issued')   AS active_issues,
                COUNT(*) FILTER (WHERE status = 'returned') AS total_returns,
                COUNT(*) FILTER (WHERE status = 'issued' AND due_date < CURRENT_DATE) AS overdue_count,
                COALESCE(SUM(fine_amount), 0)               AS total_fines_collected
            FROM transactions
        `);
        return result.rows[0];
    }
};

module.exports = TransactionModel;
