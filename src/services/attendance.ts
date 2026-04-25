import api from '@/lib/api/client';
import { ApiResponse, Attendance } from '@/types';

export const attendanceService = {
  getAttendance: async (date?: string) => {
    const params = date ? { date } : undefined;
    const response = await api.get<ApiResponse<Attendance[]>>('/attendance', { params });
    return response.data;
  },

  getMyAttendance: async () => {
    const response = await api.get<ApiResponse<Attendance[]>>('/attendance/my');
    return response.data;
  },

  checkIn: async (data?: { employee_id?: string; notes?: string }) => {
    const response = await api.post<ApiResponse<Attendance>>('/attendance/check-in', data);
    return response.data;
  },

  checkOut: async (data?: { employee_id?: string; notes?: string }) => {
    const response = await api.post<ApiResponse<Attendance>>('/attendance/check-out', data);
    return response.data;
  },

  getAttendanceReports: async (startDate: string, endDate: string) => {
    const response = await api.get<ApiResponse<any>>('/attendance/reports', {
      params: { start: startDate, end: endDate },
    });
    return response.data;
  },
};
