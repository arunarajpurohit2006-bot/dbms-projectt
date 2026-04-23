// ============================================================
// src/pages/Login.jsx
// Login form — works for both Admin and Student
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login, loading, error, setError, user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });

    // If already logged in, redirect away from login page
    useEffect(() => {
        if (user) navigate(user.role === 'admin' ? '/admin' : '/student');
        setError('');
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        login(form.email, form.password);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Logo / Branding */}
                <div className="auth-logo">
                    <span className="auth-logo-icon">📚</span>
                    <h1>LibraryMS</h1>
                    <p>Library Management System</p>
                </div>

                <h2>Welcome back</h2>

                {/* Error message */}
                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Quick login hints for testing */}
                <div className="alert alert-warning" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
                    <div><strong>Test Accounts (all use password: admin123)</strong></div>
                    <div>Admin: admin@library.com</div>
                    <div>Student: alice@student.com</div>
                </div>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
