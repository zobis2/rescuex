import axios from 'axios';

let currentURL = window.location.href;
const envReactHost = process.env.REACT_APP_API_HOST;
const extractedBaseURL = currentURL.includes('localhost:8000')
    ? 'http://localhost:8000/'
    : currentURL.includes('localhost') ? envReactHost : currentURL.split('/').slice(0, 3).join('/');

const axiosInstance = axios.create({
    baseURL: extractedBaseURL
});
const envFlaskHost = process.env.REACT_APP_FLASK_API_HOST;

// Interceptor to modify the base URL for specific routes and add CORS headers
axiosInstance.interceptors.request.use(config => {
    if (config.url.startsWith('/flask')) {
        config.baseURL = currentURL.includes('localhost:8000')
            ? 'http://localhost:8000/'
            : currentURL.includes('localhost') ? envFlaskHost : currentURL.split('/').slice(0, 3).join('/');
    } else {
        config.baseURL = extractedBaseURL;
    }

    // // Add CORS headers to each request
    // config.headers['Access-Control-Allow-Origin'] = '*';
    // config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    // config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

    return config;
}, error => {
    return Promise.reject(error);
});

export default axiosInstance;
