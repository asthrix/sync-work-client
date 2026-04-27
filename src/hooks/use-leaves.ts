import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leavesService } from '@/services/leaves';

export const leavesKeys = {
  all: ['leaves'] as const,
  detail: (id: string) => ['leaves', id] as const,
  types: ['leave-types'] as const,
  balance: ['leave-balance'] as const,
};

export function useLeaves(status?: string) {
  return useQuery({
    queryKey: status ? [...leavesKeys.all, status] : leavesKeys.all,
    queryFn: () => leavesService.getLeaves(status),
  });
}

export function useLeave(id: string) {
  return useQuery({
    queryKey: leavesKeys.detail(id),
    queryFn: () => leavesService.getLeave(id),
    enabled: !!id,
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leavesService.createLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavesKeys.all });
      queryClient.invalidateQueries({ queryKey: leavesKeys.balance });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) =>
      leavesService.approveLeave(id, approvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavesKeys.all });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      leavesService.rejectLeave(id, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavesKeys.all });
    },
  });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: leavesKeys.types,
    queryFn: leavesService.getLeaveTypes,
  });
}

export function useLeaveBalance() {
  return useQuery({
    queryKey: leavesKeys.balance,
    queryFn: leavesService.getLeaveBalance,
  });
}
