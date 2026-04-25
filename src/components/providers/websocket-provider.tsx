'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { wsManager } from '@/lib/websocket/client';
import { toast } from 'sonner';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch token from BFF endpoint and connect
      fetch('/api/auth/token')
        .then((res) => res.json() as { token?: string })
        .then((data) => {
          if (data.token) {
            wsManager.connect(data.token);
          }
        })
        .catch((err) => {
          console.error('[WebSocketProvider] Failed to get token:', err);
        });

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
