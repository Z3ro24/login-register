import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/slices/auth.slice';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for automatic token refresh on HTTP 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh access token using HTTP-Only refresh cookie
        await api.post('/auth/refresh');
        // Retry original request with newly issued cookie
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth state and redirect to login if refresh fails
        store.dispatch(logout());
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
