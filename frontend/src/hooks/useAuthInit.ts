import { useEffect, useState } from 'react';
import { useAppDispatch } from '../store/store';
import { setCredentials, logout } from '../store/slices/auth.slice';
import authService from '../services/authService';
import { setCsrfToken } from '../services/apiService';

export const useAuthInit = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Fetch and set CSRF token on app initialization
        try {
          const { csrfToken } = await authService.getCsrfToken();
          setCsrfToken(csrfToken);
        } catch {
          // Ignore if CSRF endpoint fails during init
        }

        const user = await authService.getMe();
        if (isMounted) {
          dispatch(setCredentials(user));
        }
      } catch {
        if (isMounted) {
          dispatch(logout());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return { isLoading };
};

export default useAuthInit;
