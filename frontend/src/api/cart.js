// src/api/cart.js
import API from './index';

export const addToCart = async ({ productId, quantity, paddlePriceId, token }) => {
    const { data } = await API.post(
        '/api/cart',
        { productId, quantity, paddlePriceId },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
};

export const getCart = async (token) => {
    const { data } = await API.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const deleteFromCart = async (productId, token) => {
    const { data } = await API.delete(`/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
