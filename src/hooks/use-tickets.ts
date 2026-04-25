import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService } from '@/services/tickets';

export const ticketsKeys = {
  all: ['tickets'] as const,
  detail: (id: string) => ['tickets', id] as const,
  comments: (ticketId: string) => ['tickets', ticketId, 'comments'] as const,
};

export function useTickets() {
  return useQuery({
    queryKey: ticketsKeys.all,
    queryFn: ticketsService.getTickets,
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketsKeys.detail(id),
    queryFn: () => ticketsService.getTicket(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ticketsService.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      ticketsService.assignTicket(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
    },
  });
}

export function useResolveTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ticketsService.resolveTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
    },
  });
}

export function useTicketComments(ticketId: string) {
  return useQuery({
    queryKey: ticketsKeys.comments(ticketId),
    queryFn: () => ticketsService.getTicketComments(ticketId),
    enabled: !!ticketId,
  });
}

export function useAddTicketComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, content }: { ticketId: string; content: string }) =>
      ticketsService.addComment(ticketId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.comments(variables.ticketId) });
    },
  });
}
