import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema, type RegisterSchemaType } from '../../validators/authValidator';
import authService from '../../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      navigate('/');
    },
  });

  const onSubmit = (data: RegisterSchemaType) => {
    registerMutation.mutate(data);
  };

  return (
    <div>
      <h2>Crear Cuenta</h2>
      {registerMutation.isError && (
        <p style={{ color: 'red' }}>
          {(registerMutation.error as any)?.response?.data?.message || 'Error al registrar usuario'}
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name">Nombre:</label>
          <input id="name" type="text" {...register('name')} />
          {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
        </div>

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

        <button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Registrando...' : 'Crear Cuenta'}
        </button>
      </form>

      <p>
        ¿Ya tienes cuenta? <Link to="/">Inicia Sesión</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
