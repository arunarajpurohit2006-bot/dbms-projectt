// ============================================================
// src/App.jsx
// Root component — sets up all routes and wraps with providers
// ============================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login          from './pages/Login';
import Register       from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import BookList       from './pages/BookList';
import Transactions   from './pages/Transactions';
import MyBooks        from './pages/MyBooks';

import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />
                <div className="main-content">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login"    element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Admin-only routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute role="admin">
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/transactions" element={
                            <ProtectedRoute role="admin">
                                <Transactions />
                            </ProtectedRoute>
                        } />

                        {/* Student-only routes */}
                        <Route path="/student" element={
                            <ProtectedRoute role="student">
                                <StudentDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/my-books" element={
                            <ProtectedRoute role="student">
                                <MyBooks />
                            </ProtectedRoute>
                        } />

                        {/* Shared routes (any logged-in user) */}
                        <Route path="/books" element={
                            <ProtectedRoute>
                                <BookList />
                            </ProtectedRoute>
                        } />

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
