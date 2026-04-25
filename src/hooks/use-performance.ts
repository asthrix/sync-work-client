import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceService } from '@/services/performance';

export const performanceKeys = {
  all: ['performance-reviews'] as const,
  detail: (id: string) => ['performance-reviews', id] as const,
};

export function usePerformanceReviews() {
  return useQuery({
    queryKey: performanceKeys.all,
    queryFn: performanceService.getPerformanceReviews,
  });
}

export function usePerformanceReview(id: string) {
  return useQuery({
    queryKey: performanceKeys.detail(id),
    queryFn: () => performanceService.getPerformanceReview(id),
    enabled: !!id,
  });
}

export function useCreatePerformanceReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: performanceService.createPerformanceReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.all });
    },
  });
}

export function useUpdatePerformanceReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof performanceService.updatePerformanceReview>[1] }) =>
      performanceService.updatePerformanceReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.all });
    },
  });
}
