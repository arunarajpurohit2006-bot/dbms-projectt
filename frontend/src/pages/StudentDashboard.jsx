// ============================================================
// src/pages/StudentDashboard.jsx
// Student home: my issued books, reservations, quick stats
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [transactions,  setTransactions]  = useState([]);
    const [reservations,  setReservations]  = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [returnMsg,     setReturnMsg]     = useState('');
    const [cancelMsg,     setCancelMsg]     = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tRes, rRes] = await Promise.all([
                API.get('/transactions/my'),
                API.get('/reservations/my'),
            ]);
            setTransactions(tRes.data);
            setReservations(rRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Self-return for students
    const handleReturn = async (transactionId) => {
        if (!window.confirm('Return this book?')) return;
        try {
            const res = await API.post('/transactions/return', { transaction_id: transactionId });
            setReturnMsg(res.data.message + (res.data.fine || ''));
            fetchData();
        } catch (err) {
            setReturnMsg(err.response?.data?.message || 'Return failed.');
        }
    };

    // Cancel a reservation
    const handleCancel = async (reservationId) => {
        try {
            await API.put(`/reservations/${reservationId}/cancel`);
            setCancelMsg('Reservation cancelled.');
            fetchData();
        } catch (err) {
            setCancelMsg(err.response?.data?.message || 'Cancel failed.');
        }
    };

    // Filter out returned transactions for "currently issued" view
    const activeIssues = transactions.filter(t => t.status === 'issued');
    const activeReservations = reservations.filter(r => r.status === 'active');

    // Check if a transaction is overdue
    const isOverdue = (dueDate) => new Date(dueDate) < new Date();

    const statusBadge = (status, dueDate) => {
        if (status === 'returned') return <span className="badge badge-success">Returned</span>;
        if (isOverdue(dueDate))   return <span className="badge badge-danger">Overdue</span>;
        return <span className="badge badge-primary">Issued</span>;
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Dashboard</h1>
                    <p className="page-subtitle">Hello, {user?.name} 👋 — here's your library activity</p>
                </div>
                <Link to="/books" className="btn btn-primary">Browse Books</Link>
            </div>

            {/* ---- STATS ---- */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">📖</div>
                    <div>
                        <div className="stat-label">Books Issued</div>
                        <div className="stat-value">{activeIssues.length} / 3</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon yellow">🔖</div>
                    <div>
                        <div className="stat-label">Reservations</div>
                        <div className="stat-value">{activeReservations.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red">⚠️</div>
                    <div>
                        <div className="stat-label">Overdue</div>
                        <div className="stat-value" style={{ color: activeIssues.filter(t => isOverdue(t.due_date)).length > 0 ? '#dc2626' : 'inherit' }}>
                            {activeIssues.filter(t => isOverdue(t.due_date)).length}
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div>
                        <div className="stat-label">Total Returned</div>
                        <div className="stat-value">{transactions.filter(t => t.status === 'returned').length}</div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {returnMsg && <div className="alert alert-success">✅ {returnMsg}</div>}
            {cancelMsg && <div className="alert alert-success">✅ {cancelMsg}</div>}

            {/* ---- CURRENTLY ISSUED ---- */}
            <div className="section-title">📖 Currently Issued Books</div>
            {activeIssues.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <p>No books currently issued. <Link to="/books" style={{ color: '#2563eb' }}>Browse books</Link> to issue one.</p>
                </div>
            ) : (
                <div className="table-wrapper" style={{ marginBottom: '2rem' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Book</th>
                                <th>Author</th>
                                <th>Issue Date</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeIssues.map(t => (
                                <tr key={t.transaction_id}>
                                    <td style={{ fontWeight: 600 }}>{t.book_title}</td>
                                    <td className="td-muted">{t.book_author}</td>
                                    <td className="td-muted">{new Date(t.issue_date).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{ color: isOverdue(t.due_date) ? '#dc2626' : 'inherit', fontWeight: isOverdue(t.due_date) ? 700 : 400 }}>
                                            {new Date(t.due_date).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td>{statusBadge(t.status, t.due_date)}</td>
                                    <td>
                                        <button className="btn btn-sm btn-success" onClick={() => handleReturn(t.transaction_id)}>
                                            Return
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ---- RESERVATIONS ---- */}
            {activeReservations.length > 0 && (
                <>
                    <div className="section-title">🔖 My Reservations</div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Book</th>
                                    <th>Author</th>
                                    <th>Reserved On</th>
                                    <th>Expires</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeReservations.map(r => (
                                    <tr key={r.reservation_id}>
                                        <td style={{ fontWeight: 600 }}>{r.book_title}</td>
                                        <td className="td-muted">{r.author}</td>
                                        <td className="td-muted">{new Date(r.reserved_at).toLocaleDateString()}</td>
                                        <td className="td-muted">{new Date(r.expires_at).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleCancel(r.reservation_id)}>
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentDashboard;
