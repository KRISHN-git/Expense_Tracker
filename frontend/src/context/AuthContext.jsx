
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { googleLogout } from '@react-oauth/google';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkUserLoggedIn(token);
        } else {
            setLoading(false);
        }
    }, []);

    const checkUserLoggedIn = async (token) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            // Assuming we have a /auth/me route or similar to validate token/get user
            // For now, if we don't have that route, we can just decode the token or trust it until 401
            // But let's verify with the backend
            const { data } = await axios.get(`${API_BASE_URL}/auth/me`, config);
            setUser(data);
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        localStorage.setItem('token', data.token);
        setUser(data);
        return data;
    };

    const signup = async (name, email, password) => {
        const { data } = await axios.post(`${API_BASE_URL}/auth/signup`, { name, email, password });
        localStorage.setItem('token', data.token);
        setUser(data);
        return data;
    };

    const googleLogin = async (token) => {
        const { data } = await axios.post(`${API_BASE_URL}/auth/google`, { token });
        localStorage.setItem('token', data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        googleLogout();
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
