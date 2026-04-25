'use client';

import { useCallback } from 'react';
import { wsManager } from '@/lib/websocket/client';
import { Notification } from '@/types';

export function useNotificationsWebSocket() {
  const onNotification = useCallback((callback: (notification: Notification) => void) => {
    return wsManager.on('notification', (data) => {
      callback(data as Notification);
    });
  }, []);

  const onPresence = useCallback((callback: (data: { user_id: string; status: string }) => void) => {
    return wsManager.on('presence', (data) => {
      callback(data);
    });
  }, []);

  return {
    onNotification,
    onPresence,
  };
}
