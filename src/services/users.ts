import api from '@/lib/api/client';
import { ApiResponse, User, Role, Permission, PaginatedResponse } from '@/types';

export const userService = {
  // Users
  getUsers: async (params?: { page?: number; limit?: number; search?: string; status?: string; role?: string }) => {
    const response = await api.get<PaginatedResponse<User[]>>('/users', { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: Partial<User> & { password: string }) => {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
  },

  changePassword: async (id: string, data: { current_password: string; new_password: string }) => {
    const response = await api.put<ApiResponse<void>>(`/users/${id}/password`, data);
    return response.data;
  },

  assignRole: async (userId: string, roleId: string) => {
    const response = await api.post<ApiResponse<void>>(`/users/${userId}/roles`, { role_id: roleId });
    return response.data;
  },

  removeRole: async (userId: string, roleId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/users/${userId}/roles/${roleId}`);
    return response.data;
  },

  activateUser: async (id: string) => {
    const response = await api.post<ApiResponse<User>>(`/users/${id}/activate`);
    return response.data;
  },

  deactivateUser: async (id: string) => {
    const response = await api.post<ApiResponse<User>>(`/users/${id}/deactivate`);
    return response.data;
  },

  // Roles
  getRoles: async () => {
    const response = await api.get<ApiResponse<Role[]>>('/roles');
    return response.data;
  },

  createRole: async (data: Partial<Role>) => {
    const response = await api.post<ApiResponse<Role>>('/roles', data);
    return response.data;
  },

  getRole: async (id: string) => {
    const response = await api.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data;
  },

  updateRole: async (id: string, data: Partial<Role>) => {
    const response = await api.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/roles/${id}`);
    return response.data;
  },

  // Permissions
  getPermissions: async () => {
    const response = await api.get<ApiResponse<Permission[]>>('/permissions');
    return response.data;
  },
};
