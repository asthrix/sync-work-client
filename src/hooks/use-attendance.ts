import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance';

export const attendanceKeys = {
  all: ['attendance'] as const,
  my: ['attendance', 'my'] as const,
  reports: (start: string, end: string) => ['attendance', 'reports', start, end] as const,
};

export function useAttendance(date?: string) {
  return useQuery({
    queryKey: date ? [...attendanceKeys.all, date] : attendanceKeys.all,
    queryFn: () => attendanceService.getAttendance(date),
  });
}

export function useMyAttendance() {
  return useQuery({
    queryKey: attendanceKeys.my,
    queryFn: attendanceService.getMyAttendance,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.my });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.my });
    },
  });
}

export function useAttendanceReports(startDate: string, endDate: string) {
  return useQuery({
    queryKey: attendanceKeys.reports(startDate, endDate),
    queryFn: () => attendanceService.getAttendanceReports(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}
