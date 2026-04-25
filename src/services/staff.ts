import api from '@/lib/api/client';
import { ApiResponse, PaginatedResponse, Employee, Department, Attendance, LeaveRequest } from '@/types';

export const staffService = {
  getEmployees: async (params?: { page?: number; limit?: number; department_id?: string }) => {
    const response = await api.get<PaginatedResponse<Employee>>('/staff', { params });
    return response.data;
  },

  getEmployee: async (id: string) => {
    const response = await api.get<ApiResponse<Employee>>(`/staff/${id}`);
    return response.data;
  },

  createEmployee: async (data: { 
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    employee_code: string;
    employment_type: string;
    hire_date: string;
    job_title: string;
    department_id?: string;
    salary?: number;
    currency?: string;
  }) => {
    // Step 1: Create user first
    const userResponse = await api.post<ApiResponse<{ id: string }>>('/auth/register', {
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
    });
    
    if (!userResponse.data?.data?.id) {
      throw new Error('Failed to create user');
    }
    
    const userId = userResponse.data.data.id;
    
    // Step 2: Create employee record
    const employeeResponse = await api.post<ApiResponse<Employee>>('/staff', {
      user_id: userId,
      employee_code: data.employee_code,
      employment_type: data.employment_type,
      hire_date: data.hire_date,
      job_title: data.job_title,
      department_id: data.department_id,
      salary: data.salary,
      currency: data.currency || 'USD',
    });
    
    return employeeResponse.data;
  },

  updateEmployee: async (id: string, data: Partial<Employee>) => {
    const response = await api.put<ApiResponse<Employee>>(`/staff/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/staff/${id}`);
    return response.data;
  },

  getDepartments: async () => {
    const response = await api.get<ApiResponse<Department[]>>('/departments');
    return response.data;
  },

  createDepartment: async (data: Partial<Department>) => {
    const response = await api.post<ApiResponse<Department>>('/departments', data);
    return response.data;
  },

  checkIn: async (data: { employee_id: string; notes?: string }) => {
    const response = await api.post<ApiResponse<Attendance>>('/attendance/check-in', data);
    return response.data;
  },

  checkOut: async (data: { employee_id: string; notes?: string }) => {
    const response = await api.post<ApiResponse<Attendance>>('/attendance/check-out', data);
    return response.data;
  },

  getAttendance: async (params?: { employee_id?: string; start_date?: string; end_date?: string }) => {
    const response = await api.get<ApiResponse<Attendance[]>>('/attendance', { params });
    return response.data;
  },

  getLeaves: async () => {
    const response = await api.get<ApiResponse<LeaveRequest[]>>('/leaves');
    return response.data;
  },

  createLeave: async (data: Partial<LeaveRequest>) => {
    const response = await api.post<ApiResponse<LeaveRequest>>('/leaves', data);
    return response.data;
  },

  approveLeave: async (id: string) => {
    const response = await api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`);
    return response.data;
  },

  rejectLeave: async (id: string, reason: string) => {
    const response = await api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`, { reason });
    return response.data;
  },
};
