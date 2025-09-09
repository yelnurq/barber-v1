import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import styles from './Login.module.css';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // блокировка кнопки

  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // если уже нажали — ничего не делаем
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await axiosInstance.post('/login', {
        phone,
        password
      });

      if (response.data.status === 'success') {
        const userToken = response.data.token;
        setToken(userToken);
        localStorage.setItem('token', userToken);
        setMessage('✅ Успешный вход!');
        setTimeout(() => {
          navigate('/admin'); 
        }, 1000);
      } else {
        setMessage('❌ Неизвестная ошибка.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(`❌ ${error.response.data.message}`);
      } else {
        setMessage('❌ Ошибка подключения к серверу.');
      }
    } finally {
      setIsSubmitting(false); // снова разрешаем кнопку
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleLogin}>
        <p className={styles.loginTitle}>Вход администратора</p>
        <label className={styles.label}>Номер:</label>
        <input
          type="tel"
          className={styles.input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <label className={styles.label}>Пароль:</label>
        <input
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? 'Входим...' : 'Войти'}
        </button>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
}