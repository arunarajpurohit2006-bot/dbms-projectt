// ============================================================
// src/components/Navbar.jsx
// Top navigation bar shown on all protected pages
// ============================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Helper to highlight active nav link
    const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

    if (!user) return null; // Don't show navbar on login page

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <span className="nav-icon">📚</span>
                <span className="nav-title">Library MS</span>
            </div>

            <div className="nav-links">
                {user.role === 'admin' ? (
                    // Admin navigation
                    <>
                        <Link to="/admin"        className={isActive('/admin')}>Dashboard</Link>
                        <Link to="/books"         className={isActive('/books')}>Books</Link>
                        <Link to="/transactions"  className={isActive('/transactions')}>Transactions</Link>
                    </>
                ) : (
                    // Student navigation
                    <>
                        <Link to="/student"      className={isActive('/student')}>Dashboard</Link>
                        <Link to="/books"         className={isActive('/books')}>Browse Books</Link>
                        <Link to="/my-books"      className={isActive('/my-books')}>My Books</Link>
                    </>
                )}
            </div>

            <div className="nav-user">
                <span className="nav-user-info">
                    <span className="nav-role-badge">{user.role}</span>
                    {user.name}
                </span>
                <button onClick={logout} className="btn-logout">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
