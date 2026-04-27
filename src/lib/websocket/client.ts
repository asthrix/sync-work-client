'use client';

import { getConfig } from '@/lib/config/env';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly baseReconnectDelay = 1000;
  private readonly maxReconnectDelay = 30000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private pongTimeout: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  private token: string | null = null;
  private messageQueue: WebSocketMessage[] = [];

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
  }

  connect(token: string) {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    this.token = token;

    const config = getConfig();
    const wsUrl = `${config.WS_BASE_URL}?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPingInterval();
        this.emit('connection_status', { status: 'connected' });
        
        // Flush queued messages
        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift();
          if (msg) this.send(msg.type, msg);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle pong
          if (message.type === 'pong') {
            this.clearPongTimeout();
            return;
          }

          this.emit(message.type, message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Closed:', event.code, event.reason);
        this.isConnecting = false;
        this.stopPingInterval();
        this.emit('connection_status', { status: 'disconnected', code: event.code });
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        // WebSocket error event doesn't provide useful details
        // It's usually a connection failure (server down, wrong URL, network issue)
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          console.warn('[WebSocket] Connection failed - server may be unavailable');
        } else {
          console.warn('[WebSocket] Connection error occurred');
        }
        this.emit('connection_status', { status: 'error', message: 'Connection failed' });
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.stopPingInterval();
    this.clearPongTimeout();
    
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Not connected, queuing message');
      this.messageQueue.push({ type, ...payload });
      return false;
    }

    const message = JSON.stringify({ type, ...payload });
    this.ws.send(message);
    return true;
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('[WebSocket] Error in listener:', error);
      }
    });
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {});
        
        this.pongTimeout = setTimeout(() => {
          console.warn('[WebSocket] Pong timeout, reconnecting...');
          this.ws?.close();
        }, 10000);
      }
    }, 30000);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private clearPongTimeout() {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private scheduleReconnect() {
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    setTimeout(() => {
      this.reconnectAttempts++;
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsManager = new WebSocketManager();

export type { WebSocketMessage };
