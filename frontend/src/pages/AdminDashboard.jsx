// ============================================================
// src/pages/AdminDashboard.jsx
// Admin home: stats overview + quick actions
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();

    // State for all stats
    const [bookStats,   setBookStats]   = useState(null);
    const [txStats,     setTxStats]     = useState(null);
    const [studentCount,setStudentCount] = useState(0);
    const [overdue,     setOverdue]     = useState([]);
    const [loading,     setLoading]     = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Fire all requests in parallel for speed
                const [bRes, tRes, sRes, oRes] = await Promise.all([
                    API.get('/books/stats'),
                    API.get('/transactions/stats'),
                    API.get('/auth/students'),
                    API.get('/transactions/overdue'),
                ]);
                setBookStats(bRes.data);
                setTxStats(tRes.data);
                setStudentCount(sRes.data.length);
                setOverdue(oRes.data);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return (
        <div className="loading-container"><div className="spinner"></div></div>
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {user?.name} 👋</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link to="/books" className="btn btn-primary">+ Add Book</Link>
                    <Link to="/transactions" className="btn btn-secondary">View All Transactions</Link>
                </div>
            </div>

            {/* ---- STATS GRID ---- */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">📚</div>
                    <div>
                        <div className="stat-label">Total Books</div>
                        <div className="stat-value">{bookStats?.total_books || 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div>
                        <div className="stat-label">Available Copies</div>
                        <div className="stat-value">{bookStats?.available_copies || 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon yellow">📖</div>
                    <div>
                        <div className="stat-label">Currently Issued</div>
                        <div className="stat-value">{txStats?.active_issues || 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red">⚠️</div>
                    <div>
                        <div className="stat-label">Overdue Books</div>
                        <div className="stat-value" style={{ color: overdue.length > 0 ? '#dc2626' : 'inherit' }}>
                            {overdue.length}
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">👥</div>
                    <div>
                        <div className="stat-label">Students</div>
                        <div className="stat-value">{studentCount}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">💰</div>
                    <div>
                        <div className="stat-label">Fines Collected</div>
                        <div className="stat-value">₹{txStats?.total_fines_collected || 0}</div>
                    </div>
                </div>
            </div>

            {/* ---- OVERDUE TABLE ---- */}
            {overdue.length > 0 && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="card-header">
                        <span className="card-title">⚠️ Overdue Books ({overdue.length})</span>
                        <Link to="/transactions" className="btn btn-sm btn-secondary">View All</Link>
                    </div>
                    <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Book Title</th>
                                    <th>Due Date</th>
                                    <th>Days Overdue</th>
                                    <th>Est. Fine</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overdue.map(row => (
                                    <tr key={row.transaction_id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{row.student_name}</div>
                                            <div className="td-muted">{row.student_email}</div>
                                        </td>
                                        <td>{row.book_title}</td>
                                        <td><span className="badge badge-danger">{row.due_date}</span></td>
                                        <td style={{ color: '#dc2626', fontWeight: 700 }}>{row.days_overdue} days</td>
                                        <td style={{ fontWeight: 600 }}>₹{row.estimated_fine}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ---- QUICK ACTIONS ---- */}
            <div className="section-title">⚡ Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                    { to: '/books',        icon: '📚', label: 'Manage Books',        desc: 'Add, edit, delete books' },
                    { to: '/transactions', icon: '🔄', label: 'Issue / Return',       desc: 'Record transactions' },
                    { to: '/transactions', icon: '📋', label: 'All Transactions',     desc: 'View full history' },
                ].map(action => (
                    <Link key={action.label} to={action.to} style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = ''}>
                            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{action.icon}</div>
                            <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{action.label}</div>
                            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{action.desc}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
