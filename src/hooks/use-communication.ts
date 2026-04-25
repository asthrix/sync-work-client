import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationService } from '@/services/communication';

export const communicationKeys = {
  rooms: ['chat', 'rooms'] as const,
  messages: (roomId: string) => ['chat', 'messages', roomId] as const,
  announcements: ['announcements'] as const,
  notifications: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export function useRooms() {
  return useQuery({
    queryKey: communicationKeys.rooms,
    queryFn: communicationService.getRooms,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationService.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.rooms });
    },
  });
}

export function useMessages(roomId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: communicationKeys.messages(roomId),
    queryFn: () => communicationService.getMessages(roomId, params),
    enabled: !!roomId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: string; data: { content: string; type?: string } }) => 
      communicationService.sendMessage(roomId, data),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.messages(roomId) });
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: communicationKeys.announcements,
    queryFn: communicationService.getAnnouncements,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationService.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements });
    },
  });
}

export function useAcknowledgeAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationService.acknowledgeAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements });
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: communicationKeys.notifications,
    queryFn: communicationService.getNotifications,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: communicationKeys.unreadCount,
    queryFn: communicationService.getUnreadCount,
    refetchInterval: 60000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadCount });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadCount });
    },
  });
}
