import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { auth } from '../config/firebase';
import { authApi } from '../services/endpoints';
import { useAuthStore } from '../stores/auth-store';

export function useSessionBootstrap() {
  const setUser = useAuthStore((state) => state.setUser);
  const setReady = useAuthStore((state) => state.setReady);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('dev-token');
    if (!token) {
      setUser(null);
      setReady(true);
      queryClient.clear();
      return;
    }

    authApi.me()
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setReady(true);
      });
  }, [queryClient, setReady, setUser]);
}
