import api from '@/lib/api/client';
import { ApiResponse, Pipeline, PipelineStage, Task, PaginatedResponse } from '@/types';

export const pipelineService = {
  // Pipelines
  getPipelines: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<Pipeline>>('/pipelines', { params });
    return response.data;
  },

  getPipeline: async (id: string) => {
    const response = await api.get<ApiResponse<Pipeline>>(`/pipelines/${id}`);
    return response.data;
  },

  createPipeline: async (data: Partial<Pipeline>) => {
    const response = await api.post<ApiResponse<Pipeline>>('/pipelines', data);
    return response.data;
  },

  updatePipeline: async (id: string, data: Partial<Pipeline>) => {
    const response = await api.put<ApiResponse<Pipeline>>(`/pipelines/${id}`, data);
    return response.data;
  },

  deletePipeline: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/pipelines/${id}`);
    return response.data;
  },

  // Stages
  getStages: async (pipelineId: string) => {
    const response = await api.get<ApiResponse<PipelineStage[]>>(`/pipelines/${pipelineId}/stages`);
    return response.data;
  },

  createStage: async (pipelineId: string, data: Partial<PipelineStage>) => {
    const response = await api.post<ApiResponse<PipelineStage>>(`/pipelines/${pipelineId}/stages`, data);
    return response.data;
  },

  updateStage: async (stageId: string, data: Partial<PipelineStage>) => {
    const response = await api.put<ApiResponse<PipelineStage>>(`/pipelines/stages/${stageId}`, data);
    return response.data;
  },

  deleteStage: async (stageId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/pipelines/stages/${stageId}`);
    return response.data;
  },

  // Move task
  moveTask: async (pipelineId: string, data: { task_id: string; source_stage_id: string; target_stage_id: string; position: number }) => {
    const response = await api.post<ApiResponse<Task>>(`/pipelines/${pipelineId}/move-task`, data);
    return response.data;
  },

  // Automations
  getAutomations: async (pipelineId: string) => {
    const response = await api.get<ApiResponse<any[]>>(`/pipelines/${pipelineId}/automations`);
    return response.data;
  },

  createAutomation: async (pipelineId: string, data: any) => {
    const response = await api.post<ApiResponse<any>>(`/pipelines/${pipelineId}/automations`, data);
    return response.data;
  },

  updateAutomation: async (automationId: string, data: any) => {
    const response = await api.put<ApiResponse<any>>(`/automations/${automationId}`, data);
    return response.data;
  },

  deleteAutomation: async (automationId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/automations/${automationId}`);
    return response.data;
  },
};
