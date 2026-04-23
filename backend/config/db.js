// ============================================================
// config/db.js - PostgreSQL Database Connection
// Uses the 'pg' module Pool for efficient connection management
// ============================================================

const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool (reuses connections instead of creating new ones each time)
const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    database: process.env.DB_NAME     || 'library_db',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 10,                // maximum number of connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test the connection when server starts
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error connecting to PostgreSQL:', err.message);
    } else {
        console.log('✅ PostgreSQL connected successfully');
        release(); // release the test connection back to the pool
    }
});

// Export a query helper so all models can use it easily
// Usage: const result = await query('SELECT * FROM users WHERE id = $1', [id]);
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };
