import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditService } from '@/services/audit';

export const auditKeys = {
  logs: ['audit', 'logs'] as const,
  stats: ['audit', 'stats'] as const,
  compliance: ['audit', 'compliance'] as const,
};

export function useAuditLogs(params?: { 
  page?: number; 
  limit?: number; 
  start_date?: string; 
  end_date?: string;
  user_id?: string;
  action?: string;
  resource?: string;
}) {
  return useQuery({
    queryKey: [...auditKeys.logs, params],
    queryFn: () => auditService.getAuditLogs(params),
  });
}

export function useAuditStats() {
  return useQuery({
    queryKey: auditKeys.stats,
    queryFn: auditService.getAuditStats,
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: auditService.exportAuditLogs,
  });
}
