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
    const [cart, setCart] = useState([]);

    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);


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
            const controller = new AbortController();
            const signal = controller.signal;

            // Fetch favorites
            API.get('/api/users/favorites', { signal })
                .then(res => setFavorites(res.data.map(fav => fav._id)))
                .catch(err => { if (err.name !== 'CanceledError') console.error('Failed to fetch favorites', err) });

            // Fetch cart
            API.get('/api/cart', { signal })
                .then(res => setCart(Array.isArray(res.data) ? res.data : []))
                .catch(err => { if (err.name !== 'CanceledError') console.error('Failed to fetch cart', err) });

            return () => controller.abort();
        } else {
            // Clear data on logout
            setFavorites([]);
            setCart([]);
        }
    }, [userInfo]);

    const addToCart = useCallback(async (productId, quantity = 1) => {
        try {
            // Optimistically update UI first for a snappy feel
            setCart(prevCart => {
                const existingItem = prevCart.find(item => item.product._id === productId);
                if (existingItem) {
                    // Item exists, just update quantity
                    return prevCart.map(item => item.product._id === productId ? { ...item, quantity: item.quantity + quantity } : item);
                }
                // Item doesn't exist, need more info, API response will handle it
                // For now, we wait for the backend to give us the populated product
                return prevCart;
            });

            const { data } = await API.post('/api/cart', { productId, quantity });
            setCart(data); // Sync state with the robust data from the backend
            // You can add a success toast notification here
        } catch (error) {
            console.error("Failed to add to cart", error);
            // Add an error toast notification here
        }
    }, []);

    const removeFromCart = useCallback(async (productId) => {
        try {
            const { data } = await API.delete(`/api/cart/${productId}`);
            setCart(data);
        } catch (error) {
            console.error("Failed to remove from cart", error);
        }
    }, []);

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
        cart,
        addToCart,
        cartItemCount,
        removeFromCart
    }), [userInfo, favorites, loading, login, logout, toggleFavorite, cart, addToCart, cartItemCount, removeFromCart]);

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext