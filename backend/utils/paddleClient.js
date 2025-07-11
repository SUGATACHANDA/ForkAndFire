const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.PADDLE_API_KEY) {
    throw new Error('FATAL ERROR: PADDLE_API_KEY is not defined.');
}

const paddleApi = axios.create({
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://api.paddle.com'
        : 'https://sandbox-api.paddle.com',
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

paddleApi.interceptors.request.use(
    (config) => {
        config.headers['Authorization'] = `Bearer ${process.env.PADDLE_API_KEY.trim()}`;
        return config;
    },
    (error) => Promise.reject(error)
);

module.exports = { paddleApi };