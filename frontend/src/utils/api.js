import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

    withCredentials: true,

    headers: {
        'Content-Type': 'application/json'
    }
});

// Automatically include JWT token in requests if available
api.interceptors.request.use(
    config => {

        const userInfo = JSON.parse(
            localStorage.getItem('userInfo')
        );

        if (userInfo && userInfo.token) {
            config.headers['Authorization'] =
                `Bearer ${userInfo.token}`;
        }

        return config;
    },

    error => {
        return Promise.reject(error);
    }
);

export default api;