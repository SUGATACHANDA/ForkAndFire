// const axios = require('axios');
// const dotenv = require('dotenv');

// dotenv.config();

// if (!process.env.PADDLE_API_KEY) {
//     throw new Error('FATAL ERROR: PADDLE_API_KEY is not defined.');
// }

// const paddleApi = axios.create({
//     baseURL: process.env.NODE_ENV === 'production'
//         ? 'https://api.paddle.com'
//         : 'https://sandbox-api.paddle.com',
//     headers: { 'Content-Type': 'application/json' },
//     timeout: 15000,
// });

// paddleApi.interceptors.request.use(
//     (config) => {
//         config.headers['Authorization'] = `Bearer ${process.env.PADDLE_API_KEY.trim()}`;
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// module.exports = { paddleApi };

const axios = require('axios');

// Validate ALL required environment variables on startup.
if (!process.env.PADDLE_API_KEY) {
    throw new Error('FATAL ERROR: PADDLE_API_KEY is missing in /backend/.env');
}
if (!process.env.PADDLE_CLIENT_SIDE_TOKEN) {
    throw new Error('FATAL ERROR: PADDLE_CLIENT_SIDE_TOKEN is missing in /backend/.env');
}

const paddleApi = axios.create({
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://api.paddle.com'
        : 'https://sandbox-api.paddle.com',
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// The Axios Interceptor
paddleApi.interceptors.request.use(
    (config) => {
        // === THE FIX IS HERE: Use the correct variable names for the backend environment ===
        const apiKey = process.env.PADDLE_API_KEY;
        const clientToken = process.env.PADDLE_CLIENT_SIDE_TOKEN; // No VITE_ prefix

        config.headers['Authorization'] = `Bearer ${apiKey.trim()}`;
        config.headers['Paddle-Client-Token'] = clientToken.trim(); // Add the required header

        return config;
    },
    (error) => Promise.reject(error)
);

module.exports = { paddleApi };