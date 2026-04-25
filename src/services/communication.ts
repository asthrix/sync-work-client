import api from '@/lib/api/client';
import { ApiResponse, ChatRoom, Message, Announcement, Notification } from '@/types';

export const communicationService = {
  getRooms: async () => {
    const response = await api.get<ApiResponse<ChatRoom[]>>('/chat/rooms');
    return response.data;
  },

  createRoom: async (data: { name: string; type: string; member_ids?: string[] }) => {
    const response = await api.post<ApiResponse<ChatRoom>>('/chat/rooms', data);
    return response.data;
  },

  joinRoom: async (roomId: string) => {
    const response = await api.post<ApiResponse<void>>(`/chat/rooms/${roomId}/join`);
    return response.data;
  },

  getMessages: async (roomId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<Message[]>>(`/chat/rooms/${roomId}/messages`, { params });
    return response.data;
  },

  sendMessage: async (roomId: string, data: { content: string; type?: string }) => {
    const response = await api.post<ApiResponse<Message>>(`/chat/rooms/${roomId}/messages`, data);
    return response.data;
  },

  getAnnouncements: async () => {
    const response = await api.get<ApiResponse<Announcement[]>>('/announcements');
    return response.data;
  },

  createAnnouncement: async (data: Partial<Announcement>) => {
    const response = await api.post<ApiResponse<Announcement>>('/announcements', data);
    return response.data;
  },

  acknowledgeAnnouncement: async (id: string) => {
    const response = await api.post<ApiResponse<void>>(`/announcements/${id}/acknowledge`);
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put<ApiResponse<void>>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put<ApiResponse<void>>('/notifications/read-all');
    return response.data;
  },
};
