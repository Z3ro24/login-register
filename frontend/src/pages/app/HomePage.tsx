import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout as logoutAction } from '../../store/slices/auth.slice';
import authService from '../../services/authService';

const HomePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      dispatch(logoutAction());
      navigate('/');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div>
      <h2>Bienvenido {user?.name ?? 'Usuario'}</h2>
      <p>Email: {user?.email}</p>
      <p>Rol: {user?.role}</p>
      <button onClick={handleLogout} disabled={logoutMutation.isPending}>
        {logoutMutation.isPending ? 'Cerrando sesión...' : 'Cerrar Sesión'}
      </button>
    </div>
  );
};

export default HomePage;
