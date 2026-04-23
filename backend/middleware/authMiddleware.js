// ============================================================
// middleware/authMiddleware.js
// Protects routes by verifying JWT tokens
// ============================================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

// ---- protect -----------------------------------------------
// Verifies that the request has a valid JWT token.
// Used on any route that requires login.
const protect = (req, res, next) => {
    // JWT is sent in the Authorization header as: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // extract just the token part

    try {
        // Verify the token using our secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user info to request object for use in controllers
        req.user = decoded; // contains: { user_id, email, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Not authorized. Invalid or expired token.' });
    }
};

// ---- adminOnly ---------------------------------------------
// Restricts access to admin-only routes.
// Must be used AFTER the protect middleware.
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

module.exports = { protect, adminOnly };
