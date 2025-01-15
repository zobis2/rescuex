// axiosConfig.js
const axios = require('axios');

const axiosInstance = axios.create({
    baseURL: process.env.FLASK_APP_API_HOST || 'https://web.atom.construction', // Fallback to localhost if env var is not set
});

module.exports = axiosInstance;
