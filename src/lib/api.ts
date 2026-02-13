import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Auto-inject institute context from URL
        const match = window.location.pathname.match(/\/institutes\/(\d+)/);
        if (match && config.headers) {
            config.headers['X-Institute-ID'] = match[1];
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                // If no refresh token, just fail the request normally
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            try {
                const response = await axios.post(`${API_URL}/auth/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Token refresh failed. Clear tokens and retry original request anonymously.
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');

                // Retry without token
                delete originalRequest.headers.Authorization;
                return api(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
