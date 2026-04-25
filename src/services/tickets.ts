import api from '@/lib/api/client';
import { ApiResponse, Ticket, TicketComment } from '@/types';

export const ticketsService = {
  getTickets: async () => {
    const response = await api.get<ApiResponse<Ticket[]>>('/tickets');
    return response.data;
  },

  getTicket: async (id: string) => {
    const response = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return response.data;
  },

  createTicket: async (data: Partial<Ticket>) => {
    const response = await api.post<ApiResponse<Ticket>>('/tickets', data);
    return response.data;
  },

  updateTicket: async (id: string, data: Partial<Ticket>) => {
    const response = await api.put<ApiResponse<Ticket>>(`/tickets/${id}`, data);
    return response.data;
  },

  assignTicket: async (id: string, userId: string) => {
    const response = await api.post<ApiResponse<Ticket>>(`/tickets/${id}/assign`, { user_id: userId });
    return response.data;
  },

  resolveTicket: async (id: string) => {
    const response = await api.post<ApiResponse<Ticket>>(`/tickets/${id}/resolve`);
    return response.data;
  },

  getTicketComments: async (ticketId: string) => {
    const response = await api.get<ApiResponse<TicketComment[]>>(`/tickets/${ticketId}/comments`);
    return response.data;
  },

  addComment: async (ticketId: string, content: string) => {
    const response = await api.post<ApiResponse<TicketComment>>(`/tickets/${ticketId}/comments`, { content });
    return response.data;
  },
};
