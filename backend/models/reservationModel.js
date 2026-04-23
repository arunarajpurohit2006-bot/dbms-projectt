// ============================================================
// models/reservationModel.js
// SQL queries for book reservations
// ============================================================

const { query } = require('../config/db');

const ReservationModel = {

    // Create a new reservation
    create: async (user_id, book_id) => {
        const sql = `
            INSERT INTO reservations (user_id, book_id, status)
            VALUES ($1, $2, 'active')
            RETURNING *
        `;
        const result = await query(sql, [user_id, book_id]);
        return result.rows[0];
    },

    // Cancel a reservation
    cancel: async (reservation_id, user_id) => {
        // user_id ensures students can only cancel their own reservations
        const sql = `
            UPDATE reservations SET status = 'cancelled'
            WHERE reservation_id = $1 AND user_id = $2 AND status = 'active'
            RETURNING *
        `;
        const result = await query(sql, [reservation_id, user_id]);
        return result.rows[0];
    },

    // Mark reservation as fulfilled (when book is issued after reservation)
    fulfill: async (user_id, book_id) => {
        const sql = `
            UPDATE reservations SET status = 'fulfilled'
            WHERE user_id = $1 AND book_id = $2 AND status = 'active'
            RETURNING *
        `;
        const result = await query(sql, [user_id, book_id]);
        return result.rows[0];
    },

    // Check if a student already has an active reservation for a book
    findActive: async (user_id, book_id) => {
        const sql = `
            SELECT * FROM reservations
            WHERE user_id = $1 AND book_id = $2 AND status = 'active'
        `;
        const result = await query(sql, [user_id, book_id]);
        return result.rows[0];
    },

    // Get all reservations (admin view)
    getAll: async () => {
        const sql = `
            SELECT
                r.reservation_id,
                u.name          AS student_name,
                u.email         AS student_email,
                b.title         AS book_title,
                b.author,
                r.reserved_at,
                r.expires_at,
                r.status
            FROM reservations r
            JOIN users u ON r.user_id = u.user_id
            JOIN books b ON r.book_id = b.book_id
            ORDER BY r.reserved_at DESC
        `;
        const result = await query(sql);
        return result.rows;
    },

    // Get reservations for a specific student
    getByUser: async (user_id) => {
        const sql = `
            SELECT
                r.reservation_id,
                b.title         AS book_title,
                b.author,
                b.available_copies,
                r.reserved_at,
                r.expires_at,
                r.status
            FROM reservations r
            JOIN books b ON r.book_id = b.book_id
            WHERE r.user_id = $1
            ORDER BY r.reserved_at DESC
        `;
        const result = await query(sql, [user_id]);
        return result.rows;
    },

    // Expire old reservations (can be run as a cron job)
    expireOld: async () => {
        const sql = `
            UPDATE reservations SET status = 'expired'
            WHERE status = 'active' AND expires_at < NOW()
            RETURNING reservation_id
        `;
        const result = await query(sql);
        return result.rows;
    }
};

module.exports = ReservationModel;
