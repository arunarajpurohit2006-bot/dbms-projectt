// ============================================================
// src/pages/Transactions.jsx
// Admin: view all transactions, issue & return books
// ============================================================

import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [tab,          setTab]          = useState('all');  // 'all' | 'overdue'
    const [loading,      setLoading]      = useState(true);
    const [message,      setMessage]      = useState('');
    const [isError,      setIsError]      = useState(false);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const endpoint = tab === 'overdue' ? '/transactions/overdue' : '/transactions';
            const res = await API.get(endpoint);
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTransactions(); }, [tab]);

    const handleReturn = async (transactionId) => {
        if (!window.confirm('Mark this book as returned?')) return;
        try {
            const res = await API.post('/transactions/return', { transaction_id: transactionId });
            setMessage(res.data.message + ' ' + (res.data.fine || ''));
            setIsError(false);
            fetchTransactions();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Return failed.');
            setIsError(true);
        }
    };

    const isOverdue = (dueDate, status) =>
        status === 'issued' && new Date(dueDate) < new Date();

    const statusBadge = (status, dueDate) => {
        if (status === 'returned') return <span className="badge badge-success">Returned</span>;
        if (isOverdue(dueDate, status)) return <span className="badge badge-danger">Overdue</span>;
        return <span className="badge badge-primary">Issued</span>;
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📋 Transactions</h1>
                    <p className="page-subtitle">Track all book issue and return activity</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
                    All Transactions
                </button>
                <button className={`tab ${tab === 'overdue' ? 'active' : ''}`} onClick={() => setTab('overdue')}>
                    ⚠️ Overdue Only
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>
                    {isError ? '⚠️' : '✅'} {message}
                    <button onClick={() => setMessage('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                </div>
            )}

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : transactions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <p>{tab === 'overdue' ? 'No overdue books. 🎉' : 'No transactions yet.'}</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student</th>
                                <th>Book</th>
                                <th>Issue Date</th>
                                <th>Due Date</th>
                                <th>Return Date</th>
                                <th>Status</th>
                                <th>Fine (₹)</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t, i) => (
                                <tr key={t.transaction_id}>
                                    <td className="td-muted">{i + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{t.student_name}</div>
                                        <div className="td-muted">{t.student_email}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{t.book_title}</div>
                                        <div className="td-muted">{t.book_author}</div>
                                    </td>
                                    <td className="td-muted">{new Date(t.issue_date).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{ color: isOverdue(t.due_date, t.status) ? '#dc2626' : 'inherit', fontWeight: isOverdue(t.due_date, t.status) ? 700 : 400 }}>
                                            {new Date(t.due_date).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="td-muted">
                                        {t.return_date ? new Date(t.return_date).toLocaleDateString() : '—'}
                                    </td>
                                    <td>{statusBadge(t.status, t.due_date)}</td>
                                    <td style={{ fontWeight: t.fine_amount > 0 ? 700 : 400, color: t.fine_amount > 0 ? '#dc2626' : 'inherit' }}>
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
            )}
        </div>
    );
};

export default Transactions;
