'use client';

import { useCallback, useEffect, useState } from 'react';
import { wsManager } from '@/lib/websocket/client';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsub = wsManager.on('connection_status', (data) => {
      setIsConnected(data.status === 'connected');
    });
    
    // Check initial state
    setIsConnected(wsManager.isConnected);

    return () => unsub();
  }, []);

  const send = useCallback((type: string, payload: any) => {
    return wsManager.send(type, payload);
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    return wsManager.on(event, callback);
  }, []);

  return {
    isConnected,
    send,
    subscribe,
  };
}
