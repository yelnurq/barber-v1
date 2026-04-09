import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Если токена нет, отправляем на логин
    return <Navigate to="/login" replace />;
  }

  // Если токен есть, рендерим защищенную страницу
  return children;
};

export default ProtectedRoute;