import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/lib/stores/auth-store';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.data?.user) {
        setUser(data.data.user);
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      }
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      window.location.href = '/login';
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
