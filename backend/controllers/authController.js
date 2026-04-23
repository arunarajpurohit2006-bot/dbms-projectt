// ============================================================
// controllers/authController.js
// Handles user registration and login
// ============================================================

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const UserModel = require('../models/userModel');
require('dotenv').config();

// Helper: generate JWT token for a user
const generateToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ---- REGISTER ----------------------------------------------
// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Check if email already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Hash the password (salt rounds = 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in database
        // Note: prevent users from self-registering as admin
        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role: role === 'admin' ? 'student' : (role || 'student'), // Force student role on public registration
            phone
        });

        // Generate JWT
        const token = generateToken(newUser);

        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: {
                user_id: newUser.user_id,
                name:    newUser.name,
                email:   newUser.email,
                role:    newUser.role
            }
        });
    } catch (err) {
        next(err); // Pass to global error handler
    }
};

// ---- LOGIN -------------------------------------------------
// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Look up user
        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Compare password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful!',
            token,
            user: {
                user_id: user.user_id,
                name:    user.name,
                email:   user.email,
                role:    user.role
            }
        });
    } catch (err) {
        next(err);
    }
};

// ---- GET PROFILE -------------------------------------------
// GET /api/auth/me  (protected)
const getProfile = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.user_id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (err) {
        next(err);
    }
};

// ---- GET ALL STUDENTS (admin only) -------------------------
// GET /api/auth/students
const getStudents = async (req, res, next) => {
    try {
        const students = await UserModel.getAllStudents();
        res.json(students);
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, getProfile, getStudents };
