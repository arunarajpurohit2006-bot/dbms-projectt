// ============================================================
// src/components/ProtectedRoute.jsx
// Prevents unauthenticated or unauthorized access to routes
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// role: 'admin' | 'student' | undefined (any logged-in user)
const ProtectedRoute = ({ children, role }) => {
    const { user } = useAuth();

    if (!user) {
        // Not logged in → redirect to login
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        // Wrong role → redirect to their correct dashboard
        return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
    }

    return children;
};

export default ProtectedRoute;
