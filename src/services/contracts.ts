import api from '@/lib/api/client';
import { ApiResponse, Contract } from '@/types';

export const contractsService = {
  getContracts: async () => {
    const response = await api.get<ApiResponse<Contract[]>>('/contracts');
    return response.data;
  },

  getContract: async (id: string) => {
    const response = await api.get<ApiResponse<Contract>>(`/contracts/${id}`);
    return response.data;
  },

  createContract: async (data: Partial<Contract>) => {
    const response = await api.post<ApiResponse<Contract>>('/contracts', data);
    return response.data;
  },

  updateContract: async (id: string, data: Partial<Contract>) => {
    const response = await api.put<ApiResponse<Contract>>(`/contracts/${id}`, data);
    return response.data;
  },

  renewContract: async (id: string) => {
    const response = await api.post<ApiResponse<Contract>>(`/contracts/${id}/renew`);
    return response.data;
  },

  terminateContract: async (id: string) => {
    const response = await api.post<ApiResponse<Contract>>(`/contracts/${id}/terminate`);
    return response.data;
  },

  getClientContracts: async (clientId: string) => {
    const response = await api.get<ApiResponse<Contract[]>>(`/clients/${clientId}/contracts`);
    return response.data;
  },
};
