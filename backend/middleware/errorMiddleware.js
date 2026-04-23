// ============================================================
// middleware/errorMiddleware.js
// Centralized error handling for the entire application
// ============================================================

// errorHandler catches any error passed via next(err)
const errorHandler = (err, req, res, next) => {
    // Log error details in development
    console.error('❌ Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // PostgreSQL specific errors
    if (err.code === '23505') {
        // Unique constraint violation (e.g., duplicate email/ISBN)
        return res.status(409).json({
            message: 'Duplicate entry. Record already exists.',
            detail: err.detail
        });
    }

    if (err.code === '23503') {
        // Foreign key violation
        return res.status(400).json({
            message: 'Referenced record does not exist.',
            detail: err.detail
        });
    }

    if (err.code === '23514') {
        // Check constraint violation
        return res.status(400).json({
            message: 'Data validation failed.',
            detail: err.detail
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token.' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { errorHandler };
