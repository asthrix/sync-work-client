'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { wsManager } from '@/lib/websocket/client';
import { toast } from 'sonner';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get token from localStorage directly
      const token = localStorage.getItem('access_token');
      if (token) {
        wsManager.connect(token);
      }

      const unsubStatus = wsManager.on('connection_status', (data) => {
        if (data.status === 'connected' && !connectedRef.current) {
          connectedRef.current = true;
          toast.success('Real-time connection established');
        } else if (data.status === 'disconnected' && connectedRef.current) {
          connectedRef.current = false;
          toast.error('Real-time connection lost. Reconnecting...');
        }
      });

      return () => {
        unsubStatus();
        wsManager.disconnect();
        connectedRef.current = false;
      };
    }
  }, [isAuthenticated, user]);

  return <>{children}</>;
}
