import api from '@/lib/api/client';
import { ApiResponse, AuditLog, PaginatedResponse } from '@/types';

export const auditService = {
  // Audit Logs
  getAuditLogs: async (params?: { 
    page?: number; 
    limit?: number; 
    start_date?: string; 
    end_date?: string;
    user_id?: string;
    action?: string;
    resource?: string;
  }) => {
    const response = await api.get<PaginatedResponse<AuditLog>>('/audit-logs', { params });
    return response.data;
  },

  getAuditLog: async (id: string) => {
    const response = await api.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`);
    return response.data;
  },

  searchAuditLogs: async (params: { query: string; page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<AuditLog>>('/audit-logs/search', { params });
    return response.data;
  },

  exportAuditLogs: async (params?: { format?: 'csv' | 'excel'; start_date?: string; end_date?: string }) => {
    const response = await api.get('/audit-logs/export', { 
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  getAuditStats: async () => {
    const response = await api.get<ApiResponse<any>>('/audit-logs/stats');
    return response.data;
  },

  // Compliance
  exportGDPRData: async () => {
    const response = await api.get('/compliance/gdpr/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  requestGDPRDeletion: async () => {
    const response = await api.post<ApiResponse<void>>('/compliance/gdpr/delete-request');
    return response.data;
  },

  getRetentionPolicies: async () => {
    const response = await api.get<ApiResponse<any[]>>('/compliance/retention-policies');
    return response.data;
  },

  updateRetentionPolicy: async (id: string, data: any) => {
    const response = await api.put<ApiResponse<any>>(`/compliance/retention-policies/${id}`, data);
    return response.data;
  },

  getComplianceReports: async () => {
    const response = await api.get<ApiResponse<any[]>>('/compliance/reports');
    return response.data;
  },
};
