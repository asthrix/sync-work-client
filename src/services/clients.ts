import api from '@/lib/api/client';
import { ApiResponse, PaginatedResponse, Client, Expense, Budget } from '@/types';

export const clientService = {
  getClients: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<Client>>('/clients', { params });
    return response.data;
  },

  getClient: async (id: string) => {
    const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data;
  },

  createClient: async (data: Partial<Client>) => {
    const response = await api.post<ApiResponse<Client>>('/clients', data);
    return response.data;
  },

  updateClient: async (id: string, data: Partial<Client>) => {
    const response = await api.put<ApiResponse<Client>>(`/clients/${id}`, data);
    return response.data;
  },

  deleteClient: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/clients/${id}`);
    return response.data;
  },
};

export const financeService = {
  getExpenses: async () => {
    const response = await api.get<ApiResponse<Expense[]>>('/expenses');
    return response.data;
  },

  getMyExpenses: async () => {
    const response = await api.get<ApiResponse<Expense[]>>('/expenses/my');
    return response.data;
  },

  createExpense: async (data: Partial<Expense>) => {
    const response = await api.post<ApiResponse<Expense>>('/expenses', data);
    return response.data;
  },

  approveExpense: async (id: string) => {
    const response = await api.post<ApiResponse<Expense>>(`/expenses/${id}/approve`);
    return response.data;
  },

  rejectExpense: async (id: string, reason: string) => {
    const response = await api.post<ApiResponse<Expense>>(`/expenses/${id}/reject`, { reason });
    return response.data;
  },

  getBudgets: async () => {
    const response = await api.get<ApiResponse<Budget[]>>('/budgets');
    return response.data;
  },

  createBudget: async (data: Partial<Budget>) => {
    const response = await api.post<ApiResponse<Budget>>('/budgets', data);
    return response.data;
  },
};
