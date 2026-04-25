import api from '@/lib/api/client';
import { ApiResponse, PaginatedResponse, Project, Task, Sprint, Milestone } from '@/types';

export const projectService = {
  getProjects: async (params?: { status?: string; priority?: string; page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<Project>>('/projects', { params });
    return response.data;
  },

  getProject: async (id: string) => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: Partial<Project>) => {
    const response = await api.post<ApiResponse<Project>>('/projects', data);
    return response.data;
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/projects/${id}`);
    return response.data;
  },

  getTasks: async (projectId: string) => {
    const response = await api.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`);
    return response.data;
  },

  createTask: async (projectId: string, data: Partial<Task>) => {
    const response = await api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  updateTask: async (taskId: string, data: Partial<Task>) => {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${taskId}`, data);
    return response.data;
  },

  assignTask: async (taskId: string, assigneeId: string) => {
    const response = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/assign`, { assignee_id: assigneeId });
    return response.data;
  },

  updateTaskStatus: async (taskId: string, status: string) => {
    const response = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  getSprints: async (projectId: string) => {
    const response = await api.get<ApiResponse<Sprint[]>>(`/projects/${projectId}/sprints`);
    return response.data;
  },

  createSprint: async (projectId: string, data: Partial<Sprint>) => {
    const response = await api.post<ApiResponse<Sprint>>(`/projects/${projectId}/sprints`, data);
    return response.data;
  },

  getMilestones: async (projectId: string) => {
    const response = await api.get<ApiResponse<Milestone[]>>(`/projects/${projectId}/milestones`);
    return response.data;
  },

  createMilestone: async (projectId: string, data: Partial<Milestone>) => {
    const response = await api.post<ApiResponse<Milestone>>(`/projects/${projectId}/milestones`, data);
    return response.data;
  },
};
