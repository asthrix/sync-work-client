import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/users';

export const userKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  roles: ['roles'] as const,
  permissions: ['permissions'] as const,
};

export function useUsers(params?: { page?: number; limit?: number; search?: string; status?: string; role?: string }) {
  return useQuery({
    queryKey: [...userKeys.users, params],
    queryFn: () => userService.getUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.user(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof userService.updateUser>[1] }) => 
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.users });
    },
  });
}

export function useRoles() {
  return useQuery({
    queryKey: userKeys.roles,
    queryFn: userService.getRoles,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: userKeys.permissions,
    queryFn: userService.getPermissions,
  });
}
