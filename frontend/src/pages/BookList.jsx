// ============================================================
// src/pages/BookList.jsx
// Admin: full CRUD. Student: browse, issue, reserve books.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

// ---- ADD/EDIT BOOK MODAL (admin only) ----------------------
const BookModal = ({ book, onClose, onSaved }) => {
    const isEdit = !!book?.book_id;
    const [form, setForm] = useState({
        title:         book?.title         || '',
        author:        book?.author        || '',
        isbn:          book?.isbn          || '',
        genre:         book?.genre         || '',
        publisher:     book?.publisher     || '',
        publish_year:  book?.publish_year  || '',
        total_copies:  book?.total_copies  || 1,
        shelf_location:book?.shelf_location|| '',
    });
    const [saving, setSaving]  = useState(false);
    const [error,  setError]   = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (isEdit) {
                await API.put(`/books/${book.book_id}`, form);
            } else {
                await API.post('/books', form);
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Save failed.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{isEdit ? 'Edit Book' : 'Add New Book'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Title *</label>
                            <input name="title" value={form.title} onChange={handleChange} required placeholder="Book title" />
                        </div>
                        <div className="form-group">
                            <label>Author *</label>
                            <input name="author" value={form.author} onChange={handleChange} required placeholder="Author name" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>ISBN *</label>
                            <input name="isbn" value={form.isbn} onChange={handleChange} required placeholder="978-..." disabled={isEdit} />
                        </div>
                        <div className="form-group">
                            <label>Genre</label>
                            <input name="genre" value={form.genre} onChange={handleChange} placeholder="Fiction, CS, etc." />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Publisher</label>
                            <input name="publisher" value={form.publisher} onChange={handleChange} placeholder="Publisher name" />
                        </div>
                        <div className="form-group">
                            <label>Publish Year</label>
                            <input name="publish_year" type="number" value={form.publish_year} onChange={handleChange} placeholder="e.g. 2020" min="1000" max="2026" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Total Copies</label>
                            <input name="total_copies" type="number" value={form.total_copies} onChange={handleChange} min="1" />
                        </div>
                        <div className="form-group">
                            <label>Shelf Location</label>
                            <input name="shelf_location" value={form.shelf_location} onChange={handleChange} placeholder="e.g. A-01" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (isEdit ? 'Update Book' : 'Add Book')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ---- ISSUE BOOK MODAL (admin: pick student) ----------------
const IssueModal = ({ book, onClose, onIssued }) => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user.role === 'admin') {
            API.get('/auth/students').then(r => setStudents(r.data));
        }
    }, [user]);

    const handleIssue = async () => {
        setLoading(true);
        setMessage('');
        try {
            const payload = { book_id: book.book_id };
            if (user.role === 'admin' && selectedUser) payload.user_id = selectedUser;
            const res = await API.post('/transactions/issue', payload);
            setMessage(res.data.message);
            setIsError(false);
            setTimeout(() => { onIssued(); }, 1200);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Issue failed.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Issue Book</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                    <strong>Book:</strong> {book.title}
                </p>
                <p style={{ marginBottom: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                    Due date will be set to <strong>14 days</strong> from today.
                </p>

                {user.role === 'admin' && (
                    <div className="form-group">
                        <label>Select Student *</label>
                        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                            <option value="">-- Select a student --</option>
                            {students.map(s => (
                                <option key={s.user_id} value={s.user_id}>{s.name} ({s.email})</option>
                            ))}
                        </select>
                    </div>
                )}

                {message && (
                    <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>{message}</div>
                )}

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleIssue}
                        disabled={loading || (user.role === 'admin' && !selectedUser)}
                    >
                        {loading ? 'Issuing...' : 'Confirm Issue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ---- MAIN BOOK LIST PAGE -----------------------------------
const BookList = () => {
    const { user } = useAuth();
    const [books,   setBooks]   = useState([]);
    const [genres,  setGenres]  = useState([]);
    const [search,  setSearch]  = useState('');
    const [genre,   setGenre]   = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Modal state
    const [showAddModal,   setShowAddModal]   = useState(false);
    const [editingBook,    setEditingBook]    = useState(null);
    const [issuingBook,    setIssuingBook]    = useState(null);

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (genre)  params.genre  = genre;
            const res = await API.get('/books', { params });
            setBooks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search, genre]);

    useEffect(() => {
        API.get('/books/genres').then(r => setGenres(r.data));
    }, []);

    useEffect(() => {
        const debounce = setTimeout(fetchBooks, 350); // debounce search
        return () => clearTimeout(debounce);
    }, [fetchBooks]);

    const handleDelete = async (book) => {
        if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
        try {
            await API.delete(`/books/${book.book_id}`);
            setMessage('Book deleted successfully.');
            setIsError(false);
            fetchBooks();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Delete failed.');
            setIsError(true);
        }
    };

    const handleReserve = async (book) => {
        try {
            const res = await API.post('/reservations', { book_id: book.book_id });
            setMessage(res.data.message);
            setIsError(false);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Reservation failed.');
            setIsError(true);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📚 {user.role === 'admin' ? 'Manage Books' : 'Browse Books'}</h1>
                    <p className="page-subtitle">{books.length} books found</p>
                </div>
                {user.role === 'admin' && (
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        + Add New Book
                    </button>
                )}
            </div>

            {/* ---- SEARCH & FILTER ---- */}
            <div className="search-bar">
                <input
                    className="search-input"
                    type="text"
                    placeholder="🔍 Search by title, author, or ISBN..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select className="filter-select" value={genre} onChange={e => setGenre(e.target.value)}>
                    <option value="">All Genres</option>
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {(search || genre) && (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setGenre(''); }}>
                        Clear
                    </button>
                )}
            </div>

            {/* Messages */}
            {message && (
                <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>
                    {isError ? '⚠️' : '✅'} {message}
                    <button onClick={() => setMessage('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                </div>
            )}

            {/* ---- BOOK GRID ---- */}
            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : books.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <p>No books found matching your search.</p>
                </div>
            ) : (
                <div className="books-grid">
                    {books.map(book => (
                        <div key={book.book_id} className="book-card">
                            <div className="book-card-header">
                                <h3 className="book-title">{book.title}</h3>
                                {book.available_copies > 0
                                    ? <span className="badge badge-success">Available</span>
                                    : <span className="badge badge-danger">Out of Stock</span>
                                }
                            </div>

                            <div className="book-author">by {book.author}</div>

                            <div className="book-meta">
                                {book.genre && <span className="book-genre">{book.genre}</span>}
                                <span className="book-isbn">ISBN: {book.isbn}</span>
                            </div>

                            <div className="book-copies">
                                <span style={{ color: book.available_copies > 0 ? '#16a34a' : '#dc2626' }}>
                                    {book.available_copies}
                                </span> / {book.total_copies} copies available
                                {book.shelf_location && (
                                    <span style={{ marginLeft: '0.75rem', color: '#94a3b8' }}>📍 {book.shelf_location}</span>
                                )}
                            </div>

                            {book.publish_year && (
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                                    {book.publisher && `${book.publisher} · `}{book.publish_year}
                                </div>
                            )}

                            {/* ---- ACTION BUTTONS ---- */}
                            <div className="book-actions">
                                {user.role === 'admin' ? (
                                    // Admin: Issue, Edit, Delete
                                    <>
                                        <button className="btn btn-sm btn-primary" onClick={() => setIssuingBook(book)}
                                            disabled={book.available_copies === 0}>
                                            Issue
                                        </button>
                                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingBook(book)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(book)}>
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    // Student: Issue or Reserve
                                    book.available_copies > 0 ? (
                                        <button className="btn btn-sm btn-primary" onClick={() => setIssuingBook(book)}>
                                            📖 Issue Book
                                        </button>
                                    ) : (
                                        <button className="btn btn-sm btn-warning" onClick={() => handleReserve(book)}>
                                            🔖 Reserve
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ---- MODALS ---- */}
            {showAddModal && (
                <BookModal
                    book={null}
                    onClose={() => setShowAddModal(false)}
                    onSaved={() => { setShowAddModal(false); fetchBooks(); setMessage('Book added!'); setIsError(false); }}
                />
            )}
            {editingBook && (
                <BookModal
                    book={editingBook}
                    onClose={() => setEditingBook(null)}
                    onSaved={() => { setEditingBook(null); fetchBooks(); setMessage('Book updated!'); setIsError(false); }}
                />
            )}
            {issuingBook && (
                <IssueModal
                    book={issuingBook}
                    onClose={() => setIssuingBook(null)}
                    onIssued={() => { setIssuingBook(null); fetchBooks(); }}
                />
            )}
        </div>
    );
};

export default BookList;
