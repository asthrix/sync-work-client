'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Not authenticated');
      return (await response.json()) as { success: boolean; data?: { user: any } };
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setLoading(isLoading);
    if (data?.data?.user) {
      setUser(data.data.user);
      setAuthenticated(true);
    } else if (!isLoading) {
      setAuthenticated(false);
    }
  }, [data, isLoading, setUser, setLoading, setAuthenticated]);

  return <>{children}</>;
}
