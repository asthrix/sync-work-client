'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth';

const PUBLIC_ROUTES = ['/login', '/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const [hasChecked, setHasChecked] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token');

      // Use direct backend connection via auth service
      return await authService.getMe();
    },
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    setLoading(isLoading);

    if (isLoading) return;

    // Backend returns user directly in data, not data.user
    const user = data?.data;
    if (user?.id) {
      setUser(user);
      setAuthenticated(true);
      setHasChecked(true);
      // If on login/register page and authenticated, redirect to home
      if (PUBLIC_ROUTES.includes(pathname)) {
        router.push('/');
      }
    } else if (error || !data) {
      setAuthenticated(false);
      setUser(null);
      setHasChecked(true);
      // Redirect to login if on protected route
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.push('/login');
      }
    }
  }, [data, isLoading, error, setUser, setLoading, setAuthenticated, pathname, router]);

  // Show nothing while checking auth on initial load for protected routes
  if (isLoading && !hasChecked && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
