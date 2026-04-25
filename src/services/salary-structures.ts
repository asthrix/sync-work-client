import api from '@/lib/api/client';
import { ApiResponse, SalaryStructure } from '@/types';

export const salaryStructuresService = {
  getSalaryStructures: async () => {
    const response = await api.get<ApiResponse<SalaryStructure[]>>('/salary-structures');
    return response.data;
  },

  getSalaryStructure: async (id: string) => {
    const response = await api.get<ApiResponse<SalaryStructure>>(`/salary-structures/${id}`);
    return response.data;
  },

  createSalaryStructure: async (data: Partial<SalaryStructure>) => {
    const response = await api.post<ApiResponse<SalaryStructure>>('/salary-structures', data);
    return response.data;
  },

  updateSalaryStructure: async (id: string, data: Partial<SalaryStructure>) => {
    const response = await api.put<ApiResponse<SalaryStructure>>(`/salary-structures/${id}`, data);
    return response.data;
  },
};
