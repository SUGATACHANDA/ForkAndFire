// const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

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

// --- Validate ALL required environment variables on startup ---
if (!process.env.PADDLE_API_KEY) {
    throw new Error('FATAL ERROR: PADDLE_API_KEY is not defined in the .env file.');
}
if (!process.env.PADDLE_CLIENT_SIDE_TOKEN) {
    throw new Error('FATAL ERROR: PADDLE_CLIENT_SIDE_TOKEN is not defined in the .env file.');
}


const paddleApi = axios.create({
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://api.paddle.com'
        : 'https://sandbox-api.paddle.com',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});


// === THE DEFINITIVE FIX IS IN THIS INTERCEPTOR ===
paddleApi.interceptors.request.use(
    (config) => {
        // Get both keys from the environment
        const apiKey = process.env.PADDLE_API_KEY;
        const clientToken = process.env.PADDLE_CLIENT_SIDE_TOKEN;

        // Attach the secret API key for primary authentication
        config.headers['Authorization'] = `Bearer ${apiKey.trim()}`;

        // ALSO attach the public Client-side Token, which is required for certain API endpoints.
        config.headers['Paddle-Client-Token'] = clientToken.trim();

        console.log(`🚀 Sending request to Paddle with Authorization and Client-Token headers.`);

        return config;
    },
    (error) => {
        console.error("Axios Interceptor Setup Error:", error);
        return Promise.reject(error);
    }
);


module.exports = { paddleApi };