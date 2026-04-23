// ============================================================
// src/api/axios.js
// Axios instance pre-configured with base URL and JWT header
// ============================================================

import axios from 'axios';

// Create a custom axios instance
const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Backend URL
});

// ---- REQUEST INTERCEPTOR -----------------------------------
// Automatically attach the JWT token to every request
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ---- RESPONSE INTERCEPTOR ----------------------------------
// If we get a 401 (unauthorized), clear storage and redirect to login
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
