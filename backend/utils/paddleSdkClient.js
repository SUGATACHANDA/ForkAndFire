// This file is ONLY for using the official Paddle SDK.
const { Paddle, Environment } = require('@paddle/paddle-node-sdk');

if (!process.env.PADDLE_API_KEY) {
    throw new Error('FATAL ERROR: PADDLE_API_KEY is not defined.');
}

const paddleSdk = new Paddle(process.env.PADDLE_API_KEY, {
    environment: process.env.NODE_ENV === 'production'
        ? Environment.production
        : Environment.sandbox,
});

module.exports = { paddleSdk };