// ============================================================
// src/pages/Register.jsx
// Student registration form
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { register, loading, error, setError, user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '', phone: ''
    });
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (user) navigate(user.role === 'admin' ? '/admin' : '/student');
        setError('');
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setLocalError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setLocalError('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setLocalError('Password must be at least 6 characters.');
            return;
        }
        register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
    };

    const displayError = localError || error;

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <span className="auth-logo-icon">📚</span>
                    <h1>LibraryMS</h1>
                    <p>Create your student account</p>
                </div>

                <h2>Register</h2>

                {displayError && <div className="alert alert-error">⚠️ {displayError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text" name="name" placeholder="Your full name"
                            value={form.name} onChange={handleChange} required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email" name="email" placeholder="your@email.com"
                            value={form.email} onChange={handleChange} required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password" name="password" placeholder="Min. 6 characters"
                                value={form.password} onChange={handleChange} required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password" name="confirmPassword" placeholder="Repeat password"
                                value={form.confirmPassword} onChange={handleChange} required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Phone Number (optional)</label>
                        <input
                            type="tel" name="phone" placeholder="10-digit phone number"
                            value={form.phone} onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
