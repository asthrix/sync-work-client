import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryStructuresService } from '@/services/salary-structures';

export const salaryStructuresKeys = {
  all: ['salary-structures'] as const,
  detail: (id: string) => ['salary-structures', id] as const,
};

export function useSalaryStructures() {
  return useQuery({
    queryKey: salaryStructuresKeys.all,
    queryFn: salaryStructuresService.getSalaryStructures,
  });
}

export function useSalaryStructure(id: string) {
  return useQuery({
    queryKey: salaryStructuresKeys.detail(id),
    queryFn: () => salaryStructuresService.getSalaryStructure(id),
    enabled: !!id,
  });
}

export function useCreateSalaryStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: salaryStructuresService.createSalaryStructure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryStructuresKeys.all });
    },
  });
}

export function useUpdateSalaryStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof salaryStructuresService.updateSalaryStructure>[1] }) =>
      salaryStructuresService.updateSalaryStructure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryStructuresKeys.all });
    },
  });
}
