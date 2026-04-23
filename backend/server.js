// ============================================================
// server.js - Main Express Server Entry Point
// ============================================================

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

// Import all route files
const authRoutes        = require('./routes/authRoutes');
const bookRoutes        = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

// Import error middleware
const { errorHandler } = require('./middleware/errorMiddleware');

const app  = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE SETUP
// ============================================================

// Allow requests from React frontend (running on port 3000)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Simple request logger (useful for debugging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================================
// ROUTES
// ============================================================

app.use('/api/auth',         authRoutes);         // /api/auth/login, /api/auth/register
app.use('/api/books',        bookRoutes);         // /api/books/...
app.use('/api/transactions', transactionRoutes);  // /api/transactions/...
app.use('/api/reservations', reservationRoutes);  // /api/reservations/...

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Library API is running 📚' });
});

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Library Management System API ready`);
});
