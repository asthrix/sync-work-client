import api from '@/lib/api/client';
import { ApiResponse, PerformanceReview } from '@/types';

export const performanceService = {
  getPerformanceReviews: async () => {
    const response = await api.get<ApiResponse<PerformanceReview[]>>('/performance-reviews');
    return response.data;
  },

  getPerformanceReview: async (id: string) => {
    const response = await api.get<ApiResponse<PerformanceReview>>(`/performance-reviews/${id}`);
    return response.data;
  },

  createPerformanceReview: async (data: Partial<PerformanceReview>) => {
    const response = await api.post<ApiResponse<PerformanceReview>>('/performance-reviews', data);
    return response.data;
  },

  updatePerformanceReview: async (id: string, data: Partial<PerformanceReview>) => {
    const response = await api.put<ApiResponse<PerformanceReview>>(`/performance-reviews/${id}`, data);
    return response.data;
  },
};
