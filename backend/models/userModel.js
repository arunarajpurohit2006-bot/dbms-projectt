// ============================================================
// models/userModel.js
// All SQL queries related to the 'users' table
// ============================================================

const { query } = require('../config/db');

const UserModel = {

    // Find a user by their email address
    findByEmail: async (email) => {
        const sql = 'SELECT * FROM users WHERE email = $1';
        const result = await query(sql, [email]);
        return result.rows[0]; // returns single user or undefined
    },

    // Find a user by their ID
    findById: async (user_id) => {
        const sql = 'SELECT user_id, name, email, role, phone, created_at FROM users WHERE user_id = $1';
        const result = await query(sql, [user_id]);
        return result.rows[0];
    },

    // Create a new user (registration)
    create: async ({ name, email, password, role, phone }) => {
        const sql = `
            INSERT INTO users (name, email, password, role, phone)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING user_id, name, email, role, phone, created_at
        `;
        const result = await query(sql, [name, email, password, role || 'student', phone]);
        return result.rows[0];
    },

    // Get all students (for admin view)
    getAllStudents: async () => {
        const sql = `
            SELECT user_id, name, email, phone, created_at
            FROM users
            WHERE role = 'student'
            ORDER BY created_at DESC
        `;
        const result = await query(sql);
        return result.rows;
    },

    // Get count of students (for dashboard stats)
    getStudentCount: async () => {
        const result = await query("SELECT COUNT(*) FROM users WHERE role = 'student'");
        return parseInt(result.rows[0].count);
    }
};

module.exports = UserModel;
