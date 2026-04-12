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
    // Если сервер вернул 401 (токен протух или его нет)
    if (error.response && error.response.status === 401) {
      
      // 1. Очищаем невалидный токен из памяти
      localStorage.removeItem('token');

      const loginPage = '/login';
      if (window.location.pathname !== loginPage) {
        // Можно убрать alert, если хочешь бесшовный вылет, 
        // но для админки лучше оставить уведомление
        alert('Сессия истекла или недостаточно прав. Войдите заново.');
        
        window.location.href = loginPage;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;