import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api.mjs';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const oauthToken = params.get('oauth_token');
            if (oauthToken) {
                localStorage.setItem('taskflow_token', oauthToken);
                // Bersihkan query param oauth_token dari URL tanpa reload
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
                return oauthToken;
            }
        } catch (_) {}
        return localStorage.getItem('taskflow_token') || null;
    });
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        let isMounted = true;

        const verifyUser = async () => {
            if (token) {
                try {
                    const data = await authService.getMe();
                    if (isMounted) {
                        if (data && data.user) {
                            setUser(data.user);
                            localStorage.setItem('taskflow_user', JSON.stringify(data.user));
                        } else {
                            logout();
                        }
                    }
                } catch (error) {
                    console.error('Session expired or invalid token:', error.message);
                    if (isMounted) {
                        logout();
                    }
                }
            }
            if (isMounted) {
                setLoading(false);
            }
        };

        verifyUser();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const login = async (credentials) => {
        const data = await authService.login(credentials);
        localStorage.setItem('taskflow_token', data.token);
        localStorage.setItem('taskflow_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        localStorage.setItem('taskflow_token', data.token);
        localStorage.setItem('taskflow_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const updateUser = (userData) => {
        setUser((prev) => {
            const next = { ...(prev || {}), ...(userData || {}) };
            localStorage.setItem('taskflow_user', JSON.stringify(next));
            return next;
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
