import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staff';
import { Employee, Department, LeaveRequest, Attendance } from '@/types';

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filters: any) => [...staffKeys.lists(), filters] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
  departments: () => [...staffKeys.all, 'departments'] as const,
  attendance: () => [...staffKeys.all, 'attendance'] as const,
  leaves: () => [...staffKeys.all, 'leaves'] as const,
};

export function useEmployees(filters?: { page?: number; limit?: number; search?: string; department?: string; status?: string }) {
  return useQuery({
    queryKey: staffKeys.list(filters || {}),
    queryFn: async () => {
      const response = await staffService.getEmployees(filters);
      console.log('Staff API response:', response);
      return response;
    },
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => staffService.getEmployee(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) => 
      staffService.updateEmployee(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: staffKeys.departments(),
    queryFn: staffService.getDepartments,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.departments() });
    },
  });
}

export function useAttendance(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: [...staffKeys.attendance(), params],
    queryFn: () => staffService.getAttendance(params),
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.attendance() });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.attendance() });
    },
  });
}

export function useLeaves() {
  return useQuery({
    queryKey: staffKeys.leaves(),
    queryFn: staffService.getLeaves,
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.createLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.leaves() });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) => 
      staffService.approveLeave(id, approvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.leaves() });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) => 
      staffService.rejectLeave(id, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.leaves() });
    },
  });
}
