import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '@/services/finance';

export const financeKeys = {
  expenses: ['finance', 'expenses'] as const,
  budgets: ['finance', 'budgets'] as const,
  payroll: ['finance', 'payroll'] as const,
};

export function useExpenses(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: [...financeKeys.expenses, params],
    queryFn: () => financeService.getExpenses(params),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses });
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.approveExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses });
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.rejectExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses });
    },
  });
}

export function useBudgets() {
  return useQuery({
    queryKey: financeKeys.budgets,
    queryFn: financeService.getBudgets,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets });
    },
  });
}

export function usePayroll(params?: { page?: number; limit?: number; period?: string }) {
  return useQuery({
    queryKey: [...financeKeys.payroll, params],
    queryFn: () => financeService.getPayroll(params),
  });
}

export function useGeneratePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.generatePayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payroll });
    },
  });
}
