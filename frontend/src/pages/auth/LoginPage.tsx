import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { loginSchema, type LoginSchemaType } from '../../validators/authValidator';
import authService from '../../services/authService';
import { useAppDispatch } from '../../store/store';
import { setCredentials } from '../../store/slices/auth.slice';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      dispatch(setCredentials(user));
      navigate('/home');
    },
  });

  const onSubmit = (data: LoginSchemaType) => {
    loginMutation.mutate(data);
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      {loginMutation.isError && (
        <p style={{ color: 'red' }}>
          {(loginMutation.error as any)?.response?.data?.message || 'Error al iniciar sesión'}
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" type="email" {...register('email')} />
          {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password">Contraseña:</label>
          <input id="password" type="password" {...register('password')} />
          {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
};

export default LoginPage;
