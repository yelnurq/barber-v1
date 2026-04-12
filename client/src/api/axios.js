import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  // baseURL: 'https://lumina.kz/',
});

// Добавляем токен в каждый запрос
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      
      localStorage.removeItem('token');

      const loginPage = '/login';
      if (window.location.pathname !== loginPage) {
        alert('Сессия истекла или недостаточно прав. Войдите заново.');
        
        window.location.href = loginPage;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;