import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineService } from '@/services/pipeline';

export const pipelineKeys = {
  pipelines: ['pipelines'] as const,
  pipeline: (id: string) => ['pipelines', id] as const,
  stages: (pipelineId: string) => ['pipelines', pipelineId, 'stages'] as const,
  automations: (pipelineId: string) => ['pipelines', pipelineId, 'automations'] as const,
};

export function usePipelines(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...pipelineKeys.pipelines, params],
    queryFn: () => pipelineService.getPipelines(params),
  });
}

export function usePipeline(id: string) {
  return useQuery({
    queryKey: pipelineKeys.pipeline(id),
    queryFn: () => pipelineService.getPipeline(id),
    enabled: !!id,
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pipelineService.createPipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.pipelines });
    },
  });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof pipelineService.updatePipeline>[1] }) => 
      pipelineService.updatePipeline(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.pipelines });
      queryClient.invalidateQueries({ queryKey: pipelineKeys.pipeline(id) });
    },
  });
}

export function useDeletePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pipelineService.deletePipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.pipelines });
    },
  });
}

export function useStages(pipelineId: string) {
  return useQuery({
    queryKey: pipelineKeys.stages(pipelineId),
    queryFn: () => pipelineService.getStages(pipelineId),
    enabled: !!pipelineId,
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, data }: { pipelineId: string; data: Parameters<typeof pipelineService.moveTask>[1] }) => 
      pipelineService.moveTask(pipelineId, data),
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.pipeline(pipelineId) });
      queryClient.invalidateQueries({ queryKey: pipelineKeys.stages(pipelineId) });
    },
  });
}
