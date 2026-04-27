import api from '@/lib/api/client';
import { ApiResponse, PaginatedResponse, Employee, Department, Attendance, LeaveRequest } from '@/types';

export const staffService = {
  getEmployees: async (params?: { page?: number; limit?: number; department_id?: string; search?: string }) => {
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
    let userId: string;
    
    // Step 1: Try to create user first
    try {
      const userResponse = await api.post<ApiResponse<{ id: string }>>('/auth/register', {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
      });
      
      if (!userResponse.data?.data?.id) {
        throw new Error('Failed to create user: No user ID returned');
      }
      
      userId = userResponse.data.data.id;
      console.log('User created successfully with ID:', userId);
    } catch (error: any) {
      console.error('Error creating user:', error.response?.data || error.message);
      
      // If user already exists (409), try to find the existing user
      if (error.response?.status === 409) {
        try {
          console.log('User already exists, trying to find user by email:', data.email);
          // Get users list to find existing user by email
          const usersResponse = await api.get<ApiResponse<any[]>>('/users', {
            params: { search: data.email, limit: 10 }
          });
          
          console.log('Users search response:', usersResponse.data);
          
          const existingUser = usersResponse.data?.data?.find(
            (u: any) => u.email === data.email
          );
          
          if (existingUser?.id) {
            userId = existingUser.id;
            console.log('Found existing user with ID:', userId);
          } else {
            throw new Error('User already exists but could not be found in user list');
          }
        } catch (findError: any) {
          console.error('Error finding existing user:', findError);
          throw new Error(`User with email ${data.email} already exists. Please use a different email or check if employee already exists.`);
        }
      } else {
        throw error;
      }
    }
    
    // Step 2: Create employee record
    try {
      const employeePayload = {
        user_id: userId,
        employee_code: data.employee_code,
        employment_type: data.employment_type,
        hire_date: data.hire_date,
        job_title: data.job_title,
        department_id: data.department_id,
        salary: data.salary,
        currency: data.currency || 'USD',
        status: 'active',
      };
      
      console.log('Creating employee with payload:', employeePayload);
      
      const employeeResponse = await api.post<ApiResponse<Employee>>('/staff', employeePayload);
      
      console.log('Employee created successfully:', employeeResponse.data);
      return employeeResponse.data;
    } catch (error: any) {
      console.error('Error creating employee:', error.response?.data || error.message);
      
      // If employee already exists for this user
      if (error.response?.status === 409) {
        throw new Error(`Employee already exists. Details: ${error.response?.data?.error?.message || 'Duplicate employee record'}`);
      } else if (error.response?.status === 400) {
        throw new Error(`Invalid employee data: ${error.response?.data?.error?.message || 'Please check all required fields'}`);
      }
      throw error;
    }
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

  approveLeave: async (id: string, approvedBy: string) => {
    const response = await api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`, { approved_by: approvedBy });
    return response.data;
  },

  rejectLeave: async (id: string, rejectionReason: string) => {
    const response = await api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`, { rejection_reason: rejectionReason });
    return response.data;
  },
};
