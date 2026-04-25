import api from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/types';

export interface Expense {
  id: string;
  employee_id: string;
  employee_name?: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt_url?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  name: string;
  description?: string;
  total_amount: number;
  spent_amount: number;
  department_id?: string;
  project_id?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'exhausted' | 'cancelled';
  created_at: string;
}

export interface Payroll {
  id: string;
  employee_id: string;
  employee_name?: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_pay: number;
  status: 'draft' | 'processed' | 'paid';
  created_at: string;
}

export const financeService = {
  // Expenses
  getExpenses: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get<PaginatedResponse<Expense>>('/expenses', { params });
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

  rejectExpense: async (id: string) => {
    const response = await api.post<ApiResponse<Expense>>(`/expenses/${id}/reject`);
    return response.data;
  },

  // Budgets
  getBudgets: async () => {
    const response = await api.get<ApiResponse<Budget[]>>('/budgets');
    return response.data;
  },

  createBudget: async (data: Partial<Budget>) => {
    const response = await api.post<ApiResponse<Budget>>('/budgets', data);
    return response.data;
  },

  // Payroll
  getPayroll: async (params?: { page?: number; limit?: number; period?: string }) => {
    const response = await api.get<PaginatedResponse<Payroll>>('/payroll', { params });
    return response.data;
  },

  getMyPayroll: async () => {
    const response = await api.get<ApiResponse<Payroll[]>>('/payroll/my');
    return response.data;
  },

  generatePayroll: async (data: { period_start: string; period_end: string }) => {
    const response = await api.post<ApiResponse<Payroll[]>>('/payroll/generate', data);
    return response.data;
  },

  processPayroll: async (id: string) => {
    const response = await api.post<ApiResponse<Payroll>>(`/payroll/${id}/process`);
    return response.data;
  },
};
