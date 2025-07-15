import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import API from '../api/index';

// === CRUCIAL FIX ===
// Create the context AND EXPORT IT using the `export` keyword.

const AuthContext = createContext();
// Create the Provider Component, which will also be exported.
export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const login = useCallback((userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUserInfo(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
    }, []);

    // Effect 1: Check for a persisted session on initial app load.
    useEffect(() => {
        try {
            const storedUserInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
            if (storedUserInfo) setUserInfo(storedUserInfo);
        } catch (error) {
            console.error("AuthContext: Failed to parse user info from localStorage.", error);
            localStorage.removeItem('userInfo');
            setUserInfo(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect 2: Sync user's favorites when login status changes.
    useEffect(() => {
        if (userInfo) {
            const fetchFavorites = async () => {
                try {
                    const { data } = await API.get('/api/users/favorites');
                    const favoriteIds = data.map(recipe => recipe._id);
                    setFavorites(favoriteIds);
                } catch (error) {
                    if (error.response && error.response.status === 401) logout();
                }
            };
            fetchFavorites();
        } else {
            setFavorites([]);
        }
    }, [userInfo, logout]);

    const toggleFavorite = useCallback(async (recipeId) => {
        if (!userInfo) return;

        const isCurrentlyFavorite = favorites.includes(recipeId);
        const originalFavorites = [...favorites]; // Save original state for rollback

        // Optimistic Update
        setFavorites(prev => isCurrentlyFavorite ? prev.filter(id => id !== recipeId) : [...prev, recipeId]);

        try {
            await API.put('/api/users/favorites', { recipeId });
        } catch (error) {
            console.error('AuthContext: Failed to sync favorite status with server.', error);
            alert("An error occurred. Your favorites could not be updated.");
            // Rollback on failure
            setFavorites(originalFavorites);
        }
    }, [userInfo, favorites]);

    // Memoize the context value to prevent unnecessary re-renders.
    const contextValue = useMemo(() => ({
        userInfo,
        favorites,
        loading,
        login,
        logout,
        toggleFavorite,
    }), [userInfo, favorites, loading, login, logout, toggleFavorite]);

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext