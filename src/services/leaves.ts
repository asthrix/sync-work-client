import api from '@/lib/api/client';
import { ApiResponse, LeaveRequest, LeaveType } from '@/types';

export const leavesService = {
  getLeaves: async (status?: string) => {
    const params = status ? { status } : undefined;
    const response = await api.get<ApiResponse<LeaveRequest[]>>('/leaves', { params });
    return response.data;
  },

  getLeave: async (id: string) => {
    const response = await api.get<ApiResponse<LeaveRequest>>(`/leaves/${id}`);
    return response.data;
  },

  createLeave: async (data: Partial<LeaveRequest>) => {
    const response = await api.post<ApiResponse<LeaveRequest>>('/leaves', data);
    return response.data;
  },

  approveLeave: async (id: string, approvedBy: string) => {
    const response = await api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`, { approved_by: approvedBy });
    return response.data;
  },

  rejectLeave: async (id: string, rejectionReason: string) => {
    const response = await api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`, { rejection_reason: rejectionReason });
    return response.data;
  },

  getLeaveTypes: async () => {
    const response = await api.get<ApiResponse<LeaveType[]>>('/leaves/types');
    return response.data;
  },

  getLeaveBalance: async () => {
    const response = await api.get<ApiResponse<Record<string, number>>>('/leaves/balance');
    return response.data;
  },
};
