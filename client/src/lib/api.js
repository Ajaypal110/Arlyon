import axios from 'axios';

const PROD_API_URL = 'https://arlyon.onrender.com/api';

const getBaseUrl = () => {
  if (import.meta.env.MODE === 'production' || import.meta.env.PROD) {
    return PROD_API_URL;
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('arlyon_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshUrl = getBaseUrl();
        const { data } = await axios.post(`${refreshUrl}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('arlyon_token', data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('arlyon_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
