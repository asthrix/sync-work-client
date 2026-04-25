'use client';

import { useCallback, useEffect, useRef } from 'react';
import { wsManager } from '@/lib/websocket/client';
import { Message } from '@/types';

export function useChatWebSocket(roomId: string) {
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  useEffect(() => {
    if (!roomId || !wsManager.isConnected) return;

    // Join room
    wsManager.send('join_room', { room_id: roomId });

    return () => {
      wsManager.send('leave_room', { room_id: roomIdRef.current });
    };
  }, [roomId]);

  const sendMessage = useCallback((content: string, type: string = 'text') => {
    return wsManager.send('chat', {
      room_id: roomIdRef.current,
      content,
      message_type: type,
    });
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    return wsManager.send('typing', {
      room_id: roomIdRef.current,
      is_typing: isTyping,
    });
  }, []);

  const onMessage = useCallback((callback: (message: Message) => void) => {
    return wsManager.on('chat', (data) => {
      if (data.room_id === roomIdRef.current) {
        callback(data as Message);
      }
    });
  }, []);

  const onTyping = useCallback((callback: (data: { sender_id: string; is_typing: boolean }) => void) => {
    return wsManager.on('typing', (data) => {
      if (data.room_id === roomIdRef.current) {
        callback(data);
      }
    });
  }, []);

  return {
    sendMessage,
    sendTyping,
    onMessage,
    onTyping,
  };
}
