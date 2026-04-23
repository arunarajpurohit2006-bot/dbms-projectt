// ============================================================
// src/context/AuthContext.jsx
// Global authentication state using React Context + hooks
// Any component can call useAuth() to get user/login/logout
// ============================================================

import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Provider component — wraps the entire app in App.jsx
export const AuthProvider = ({ children }) => {
    // Initialize user from localStorage so login persists on refresh
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    const navigate = useNavigate();

    // ---- LOGIN -----------------------------------------------
    const login = async (email, password) => {
        setLoading(true);
        setError('');
        try {
            const res = await API.post('/auth/login', { email, password });
            const { token, user: userData } = res.data;

            // Save to localStorage for persistence
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            // Redirect based on role
            if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/student');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ---- REGISTER --------------------------------------------
    const register = async (formData) => {
        setLoading(true);
        setError('');
        try {
            const res = await API.post('/auth/register', formData);
            const { token, user: userData } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            navigate('/student');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    // ---- LOGOUT ----------------------------------------------
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, error, setError }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Custom hook — makes using context easy anywhere in the app
// Usage: const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
