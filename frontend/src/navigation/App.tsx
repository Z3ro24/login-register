import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import HomePage from '../pages/app/HomePage';
import NotFound from '../pages/404';
import { useAuthInit } from '../hooks/useAuthInit';
import { useAppSelector } from '../store/store';

const App = () => {
  const { isLoading } = useAuthInit();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return <div>Cargando sesión...</div>;
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          {/* Rutas públicas (Login & Registro) */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          {/* Rutas privadas (Autenticado) */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Navigate to="/home" replace />} />
          <Route path="/register" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
};

export default App;
