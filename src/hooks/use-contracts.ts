import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsService } from '@/services/contracts';

export const contractsKeys = {
  all: ['contracts'] as const,
  detail: (id: string) => ['contracts', id] as const,
  client: (clientId: string) => ['clients', clientId, 'contracts'] as const,
};

export function useContracts() {
  return useQuery({
    queryKey: contractsKeys.all,
    queryFn: contractsService.getContracts,
  });
}

export function useContract(id: string) {
  return useQuery({
    queryKey: contractsKeys.detail(id),
    queryFn: () => contractsService.getContract(id),
    enabled: !!id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contractsService.createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsKeys.all });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof contractsService.updateContract>[1] }) =>
      contractsService.updateContract(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contractsKeys.all });
      queryClient.invalidateQueries({ queryKey: contractsKeys.detail(variables.id) });
    },
  });
}

export function useRenewContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contractsService.renewContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsKeys.all });
    },
  });
}

export function useTerminateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contractsService.terminateContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsKeys.all });
    },
  });
}

export function useClientContracts(clientId: string) {
  return useQuery({
    queryKey: contractsKeys.client(clientId),
    queryFn: () => contractsService.getClientContracts(clientId),
    enabled: !!clientId,
  });
}
