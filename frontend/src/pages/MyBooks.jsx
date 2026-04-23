// ============================================================
// src/pages/MyBooks.jsx
// Student: full history of issued books + reservations
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const MyBooks = () => {
    const [transactions, setTransactions] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [tab,          setTab]          = useState('issued');
    const [loading,      setLoading]      = useState(true);
    const [message,      setMessage]      = useState('');
    const [isError,      setIsError]      = useState(false);

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

    const handleReturn = async (transactionId) => {
        if (!window.confirm('Return this book?')) return;
        try {
            const res = await API.post('/transactions/return', { transaction_id: transactionId });
            setMessage(res.data.message + ' ' + (res.data.fine || ''));
            setIsError(false);
            fetchData();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Return failed.');
            setIsError(true);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        try {
            await API.put(`/reservations/${reservationId}/cancel`);
            setMessage('Reservation cancelled.');
            setIsError(false);
            fetchData();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Cancel failed.');
            setIsError(true);
        }
    };

    const isOverdue = (dueDate) => new Date(dueDate) < new Date();

    const statusBadge = (status, dueDate) => {
        if (status === 'returned') return <span className="badge badge-success">Returned</span>;
        if (isOverdue(dueDate))   return <span className="badge badge-danger">Overdue</span>;
        return <span className="badge badge-primary">Issued</span>;
    };

    const reservationBadge = (status) => {
        if (status === 'active')    return <span className="badge badge-primary">Active</span>;
        if (status === 'fulfilled') return <span className="badge badge-success">Fulfilled</span>;
        if (status === 'expired')   return <span className="badge badge-secondary">Expired</span>;
        return <span className="badge badge-danger">Cancelled</span>;
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📖 My Books</h1>
                    <p className="page-subtitle">Your complete library activity history</p>
                </div>
                <Link to="/books" className="btn btn-primary">Browse More Books</Link>
            </div>

            {message && (
                <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>
                    {isError ? '⚠️' : '✅'} {message}
                    <button onClick={() => setMessage('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${tab === 'issued' ? 'active' : ''}`} onClick={() => setTab('issued')}>
                    📖 All Issues ({transactions.length})
                </button>
                <button className={`tab ${tab === 'reservations' ? 'active' : ''}`} onClick={() => setTab('reservations')}>
                    🔖 Reservations ({reservations.length})
                </button>
            </div>

            {/* ---- TRANSACTIONS TAB ---- */}
            {tab === 'issued' && (
                transactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p>You haven't issued any books yet. <Link to="/books" style={{ color: '#2563eb' }}>Browse books →</Link></p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Book Title</th>
                                    <th>Author</th>
                                    <th>ISBN</th>
                                    <th>Issue Date</th>
                                    <th>Due Date</th>
                                    <th>Return Date</th>
                                    <th>Status</th>
                                    <th>Fine</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t.transaction_id}>
                                        <td style={{ fontWeight: 600 }}>{t.book_title}</td>
                                        <td className="td-muted">{t.book_author}</td>
                                        <td className="td-muted" style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{t.isbn}</td>
                                        <td className="td-muted">{new Date(t.issue_date).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{ color: t.status === 'issued' && isOverdue(t.due_date) ? '#dc2626' : 'inherit', fontWeight: t.status === 'issued' && isOverdue(t.due_date) ? 700 : 400 }}>
                                                {new Date(t.due_date).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="td-muted">
                                            {t.return_date ? new Date(t.return_date).toLocaleDateString() : '—'}
                                        </td>
                                        <td>{statusBadge(t.status, t.due_date)}</td>
                                        <td style={{ color: t.fine_amount > 0 ? '#dc2626' : 'inherit', fontWeight: t.fine_amount > 0 ? 700 : 400 }}>
                                            {t.fine_amount > 0 ? `₹${t.fine_amount}` : '—'}
                                        </td>
                                        <td>
                                            {t.status === 'issued' && (
                                                <button className="btn btn-sm btn-success" onClick={() => handleReturn(t.transaction_id)}>
                                                    Return
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* ---- RESERVATIONS TAB ---- */}
            {tab === 'reservations' && (
                reservations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔖</div>
                        <p>No reservations yet. Reserve unavailable books from the <Link to="/books" style={{ color: '#2563eb' }}>book list</Link>.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Book Title</th>
                                    <th>Author</th>
                                    <th>Reserved On</th>
                                    <th>Expires On</th>
                                    <th>Book Availability</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(r => (
                                    <tr key={r.reservation_id}>
                                        <td style={{ fontWeight: 600 }}>{r.book_title}</td>
                                        <td className="td-muted">{r.author}</td>
                                        <td className="td-muted">{new Date(r.reserved_at).toLocaleDateString()}</td>
                                        <td className="td-muted">{new Date(r.expires_at).toLocaleDateString()}</td>
                                        <td>
                                            {r.available_copies > 0
                                                ? <span className="badge badge-success">Now Available!</span>
                                                : <span className="badge badge-secondary">Unavailable</span>
                                            }
                                        </td>
                                        <td>{reservationBadge(r.status)}</td>
                                        <td>
                                            {r.status === 'active' && (
                                                <button className="btn btn-sm btn-danger" onClick={() => handleCancelReservation(r.reservation_id)}>
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};

export default MyBooks;
