import axios from 'axios';

// Use Next.js rewrites to proxy requests through same origin
// This avoids CORS issues in the browser
// Rewrite: /api/backend/* -> http://localhost:8080/api/v1/*
export const api = axios.create({
  baseURL: '/api/backend',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0',
  },
  withCredentials: false, // JWT in headers, not cookies
});

// Request interceptor - Add auth token
api.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = crypto.randomUUID();
  
  // Add Authorization header with Bearer token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Unwrap double-wrapped responses from backend
    // Backend returns: { success: true, data: { success: true, data: [...], pagination: {...} } }
    // We want: { success: true, data: [...], pagination: {...} }
    if (
      response.data?.success === true &&
      response.data?.data?.success === true &&
      response.data?.data?.data !== undefined
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
        const { access_token, refresh_token } = response.data.data;
        
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session_expired=true';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
