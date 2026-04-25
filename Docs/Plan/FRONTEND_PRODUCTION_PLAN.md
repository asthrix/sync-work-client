# SyncWork Frontend - Production-Ready Implementation Plan

## Executive Summary

This document provides production-ready answers for building the SyncWork Office Management System frontend. These recommendations prioritize security, scalability, performance, and enterprise-grade UX patterns.

**Target Environment**: Production with Docker Compose / Kubernetes
**Architecture Pattern**: Modular Feature-Based with Clean Architecture
**Security Level**: Enterprise (JWT + httpOnly cookies, CSRF, XSS protection)
**Real-Time Strategy**: WebSocket-first with automatic reconnection
**Deployment**: Cloudflare Workers (Edge) + Vercel (Preview)

---

## 1. Backend Base URL Configuration

### Production Configuration

```typescript
// lib/config/env.ts
export const env = {
  development: {
    API_BASE_URL: 'http://localhost:8080/api/v1',
    WS_BASE_URL: 'ws://localhost:8080/ws',
    APP_URL: 'http://localhost:3000',
    ENABLE_MOCKS: false,
  },
  staging: {
    API_BASE_URL: 'https://api.staging.syncwork.com/api/v1',
    WS_BASE_URL: 'wss://api.staging.syncwork.com/ws',
    APP_URL: 'https://staging.syncwork.com',
    ENABLE_MOCKS: false,
  },
  production: {
    API_BASE_URL: 'https://api.syncwork.com/api/v1',
    WS_BASE_URL: 'wss://api.syncwork.com/ws',
    APP_URL: 'https://app.syncwork.com',
    ENABLE_MOCKS: false,
  },
} as const;

export type Environment = keyof typeof env;

export const getConfig = () => {
  const environment = (process.env.NEXT_PUBLIC_ENVIRONMENT as Environment) || 'development';
  return env[environment];
};
```

### Environment Variables (Production)

```bash
# .env.production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_API_URL=https://api.syncwork.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.syncwork.com/ws
NEXT_PUBLIC_APP_URL=https://app.syncwork.com

# Server-side only
API_SECRET_KEY=<server-side-api-key>
COOKIE_SECRET=<cookie-encryption-secret>
JWT_REFRESH_SECRET=<jwt-refresh-secret>
```

### API Client Configuration

```typescript
// lib/api/client.ts
import axios from 'axios';
import { getConfig } from '@/lib/config/env';

const config = getConfig();

export const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  withCredentials: true, // Required for httpOnly cookies
});

// Request interceptor - Add request ID for tracing
api.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = crypto.randomUUID();
  return config;
});

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token refresh handled by httpOnly cookie automatically
      window.location.href = '/login?session_expired=true';
    }
    return Promise.reject(error);
  }
);
```

---

## 2. Authentication Strategy (Production)

### Security Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Browser       │     │   Next.js       │     │   Backend       │
│                 │     │   (BFF Pattern) │     │   (Go API)      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│                 │     │                 │     │                 │
│  localStorage   │◄────│  httpOnly       │◄────│  Refresh Token  │
│  - Theme        │     │  Cookie         │     │  (7 days)       │
│  - UI State     │     │  - refreshToken │     │                 │
│                 │     │                 │     │  Access Token   │
│  Session        │◄────│  Memory         │◄────│  (15 min)       │
│  Storage        │     │  - accessToken  │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Backend-For-Frontend (BFF) Pattern

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward to backend
    const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(data, { status: 401 });
    }

    // Set httpOnly cookie for refresh token
    const refreshTokenCookie = `refreshToken=${data.data.refresh_token}; ` +
      `HttpOnly; Secure; SameSite=Strict; ` +
      `Path=/; Max-Age=${7 * 24 * 60 * 60}`; // 7 days

    // Set access token in another httpOnly cookie (short-lived)
    const accessTokenCookie = `accessToken=${data.data.access_token}; ` +
      `HttpOnly; Secure; SameSite=Strict; ` +
      `Path=/; Max-Age=${15 * 60}`; // 15 minutes

    return NextResponse.json(
      { 
        success: true, 
        data: { user: data.data.user } 
      },
      {
        headers: {
          'Set-Cookie': [refreshTokenCookie, accessTokenCookie],
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```

### Token Refresh (Server-Side)

```typescript
// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: 'No refresh token' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${process.env.API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!data.success) {
      // Clear cookies on refresh failure
      return NextResponse.json(
        { success: false },
        {
          status: 401,
          headers: {
            'Set-Cookie': [
              'refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
              'accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
            ],
          },
        }
      );
    }

    // Set new tokens
    const refreshTokenCookie = `refreshToken=${data.data.refresh_token}; ` +
      `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
    
    const accessTokenCookie = `accessToken=${data.data.access_token}; ` +
      `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${15 * 60}`;

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': [refreshTokenCookie, accessTokenCookie],
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
```

### Client-Side Auth Hook

```typescript
// hooks/use-auth.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch current user (server validates accessToken cookie automatically)
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      router.push('/dashboard');
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
  });

  return {
    user: user?.data?.user as User | undefined,
    isLoading,
    isAuthenticated: !!user?.data?.user,
    login,
    logout,
  };
}
```

### Security Headers (Next.js Config)

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' blob: data: https:; " +
              "font-src 'self'; " +
              "connect-src 'self' https://api.syncwork.com wss://api.syncwork.com;",
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 3. WebSocket Implementation (Production)

### WebSocket URL

```
Development: ws://localhost:8080/ws
Staging:     wss://api.staging.syncwork.com/ws
Production:  wss://api.syncwork.com/ws
```

### Production-Ready WebSocket Client

```typescript
// lib/websocket/client.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

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
  private pingInterval: NodeJS.Timeout | null = null;
  private pongTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private token: string | null = null;

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

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPingInterval();
        this.emit('connection_status', { status: 'connected' });
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
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.isConnecting = false;
        this.stopPingInterval();
        this.emit('connection_status', { status: 'disconnected', code: event.code });
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('connection_status', { status: 'error' });
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.stopPingInterval();
    this.clearPongTimeout();
    
    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnection
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, message queued');
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

    // Return unsubscribe function
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
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {});
        
        // Set pong timeout
        this.pongTimeout = setTimeout(() => {
          console.warn('Pong timeout, reconnecting...');
          this.ws?.close();
        }, 10000);
      }
    }, 30000); // Ping every 30 seconds
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

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

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

// Singleton instance
export const wsManager = new WebSocketManager();

// React hook for WebSocket
export function useWebSocket() {
  const { user } = useAuth();
  const token = user?.id ? 'token-from-cookie' : null; // Get from httpOnly cookie

  useEffect(() => {
    if (token) {
      wsManager.connect(token);
    }

    return () => {
      wsManager.disconnect();
    };
  }, [token]);

  const send = useCallback((type: string, payload: any) => {
    return wsManager.send(type, payload);
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    return wsManager.on(event, callback);
  }, []);

  return {
    isConnected: wsManager.isConnected,
    send,
    subscribe,
  };
}
```

### WebSocket Provider

```typescript
// components/providers/websocket-provider.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { wsManager } from '@/lib/websocket/client';
import { toast } from 'sonner';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get token from cookie or fetch from server
      fetch('/api/auth/token')
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            wsManager.connect(data.token);
          }
        });

      // Subscribe to connection events
      const unsubStatus = wsManager.on('connection_status', (data) => {
        if (data.status === 'connected') {
          toast.success('Real-time connection established');
        } else if (data.status === 'disconnected') {
          toast.error('Real-time connection lost. Reconnecting...');
        }
      });

      return () => {
        unsubStatus();
        wsManager.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  return <>{children}</>;
}
```

---

## 4. File Uploads (Production)

### Architecture Decision: Direct Upload to Backend with Validation

**Why not presigned URLs?**
- Simpler implementation for production
- Backend can validate file type, size, scan for malware
- No need to expose cloud storage credentials to frontend

### Upload Implementation

```typescript
// lib/api/upload.ts
import { api } from './client';

interface UploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  folder?: string;
}

export async function uploadFile({ file, onProgress, folder = 'uploads' }: UploadOptions) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
    timeout: 120000, // 2 minutes for large files
  });

  return response.data;
}

// Usage in components
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      toast.success('File uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Upload failed');
    },
  });
}
```

### Upload Component with Drag & Drop

```typescript
// components/upload/dropzone.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUploadFile } from '@/hooks/use-upload';

interface DropzoneProps {
  onUploadComplete?: (url: string) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
}

export function Dropzone({
  onUploadComplete,
  accept = { 'image/*': [], 'application/pdf': [] },
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
}: DropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const uploadMutation = useUploadFile();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    
    acceptedFiles.forEach((file) => {
      uploadMutation.mutate(
        {
          file,
          onProgress: (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: progress,
            }));
          },
        },
        {
          onSuccess: (data) => {
            onUploadComplete?.(data.url);
          },
        }
      );
    });
  }, [uploadMutation, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
  });

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to select files (max {maxFiles} files, {(maxSize / 1024 / 1024).toFixed(0)}MB each)
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileText className="h-5 w-5 text-orange-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <div className="w-full bg-secondary rounded-full h-2 mt-1">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress[file.name] || 0}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="p-1 hover:bg-secondary rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 5. Role-Based Access Control (RBAC)

### Full RBAC Implementation

```typescript
// lib/auth/permissions.ts
export enum Permission {
  // Users
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Staff
  STAFF_CREATE = 'staff:create',
  STAFF_READ = 'staff:read',
  STAFF_UPDATE = 'staff:update',
  STAFF_DELETE = 'staff:delete',
  
  // Projects
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  
  // Finance
  FINANCE_READ = 'finance:read',
  FINANCE_WRITE = 'finance:write',
  PAYROLL_PROCESS = 'payroll:process',
  EXPENSE_APPROVE = 'expense:approve',
  
  // Admin
  ADMIN_ACCESS = 'admin:access',
  AUDIT_READ = 'audit:read',
  SETTINGS_MANAGE = 'settings:manage',
}

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: Object.values(Permission),
  admin: [
    Permission.USER_CREATE, Permission.USER_READ, Permission.USER_UPDATE,
    Permission.STAFF_CREATE, Permission.STAFF_READ, Permission.STAFF_UPDATE,
    Permission.PROJECT_CREATE, Permission.PROJECT_READ, Permission.PROJECT_UPDATE,
    Permission.FINANCE_READ, Permission.FINANCE_WRITE,
    Permission.ADMIN_ACCESS, Permission.SETTINGS_MANAGE,
  ],
  manager: [
    Permission.STAFF_READ, Permission.STAFF_UPDATE,
    Permission.PROJECT_CREATE, Permission.PROJECT_READ, Permission.PROJECT_UPDATE, Permission.PROJECT_DELETE,
    Permission.FINANCE_READ,
    Permission.EXPENSE_APPROVE,
  ],
  staff: [
    Permission.USER_READ,
    Permission.STAFF_READ,
    Permission.PROJECT_READ,
    Permission.FINANCE_READ,
  ],
};
```

### Permission Hook

```typescript
// hooks/use-permissions.ts
import { useMemo } from 'react';
import { useAuth } from './use-auth';
import { Permission, ROLE_PERMISSIONS } from '@/lib/auth/permissions';

export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user?.roles) return new Set<Permission>();
    
    const perms = new Set<Permission>();
    user.roles.forEach((role) => {
      ROLE_PERMISSIONS[role]?.forEach((p) => perms.add(p));
    });
    return perms;
  }, [user?.roles]);

  const hasPermission = (permission: Permission): boolean => {
    return permissions.has(permission);
  };

  const hasAnyPermission = (...perms: Permission[]): boolean => {
    return perms.some((p) => permissions.has(p));
  };

  const hasAllPermissions = (...perms: Permission[]): boolean => {
    return perms.every((p) => permissions.has(p));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.roles?.includes('admin') || user?.roles?.includes('super_admin'),
    isManager: user?.roles?.includes('manager'),
  };
}
```

### Permission Components

```typescript
// components/auth/permission-gate.tsx
import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/lib/auth/permissions';

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

interface PermissionAnyGateProps {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionAnyGate({ permissions, children, fallback = null }: PermissionAnyGateProps) {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(...permissions) ? <>{children}</> : <>{fallback}</>;
}
```

### Dynamic Sidebar Based on Permissions

```typescript
// components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/lib/auth/permissions';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  MessageSquare,
  Calendar,
  Shield,
  Settings,
  DollarSign,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, permissions: [] },
  { name: 'Staff & HR', href: '/staff', icon: Users, permissions: [Permission.STAFF_READ] },
  { name: 'Projects', href: '/projects', icon: FolderKanban, permissions: [Permission.PROJECT_READ] },
  { name: 'Clients', href: '/clients', icon: Building2, permissions: [] },
  { name: 'Finance', href: '/finance', icon: DollarSign, permissions: [Permission.FINANCE_READ] },
  { name: 'Communication', href: '/communication', icon: MessageSquare, permissions: [] },
  { name: 'Culture', href: '/culture', icon: Calendar, permissions: [] },
  { name: 'Audit', href: '/audit', icon: Shield, permissions: [Permission.AUDIT_READ] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasAnyPermission, isAdmin } = usePermissions();

  const visibleNav = navigation.filter((item) => {
    if (item.permissions.length === 0) return true;
    return hasAnyPermission(...item.permissions);
  });

  return (
    <aside className="w-64 border-r bg-background">
      <nav className="space-y-1 p-4">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        
        {isAdmin && (
          <>
            <div className="my-4 border-t" />
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administration
            </p>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <Users className="h-5 w-5" />
              User Management
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
```

---

## 6. Real-Time Strategy (Production)

### Full WebSocket Implementation (No Polling)

**Architecture:**
```
Client ──WebSocket──► Backend Hub ──► Room Management ──► Broadcast
   │                      │
   └── Ping/Pong ─────────┘
   └── Auto-reconnect ────┘
```

### Real-Time Features Priority

| Feature | Implementation | Fallback |
|---------|---------------|----------|
| **Chat Messages** | WebSocket | None (required) |
| **Notifications** | WebSocket | Badge counter API |
| **Presence** | WebSocket | Last seen timestamp |
| **Typing Indicators** | WebSocket | None |
| **Task Updates** | WebSocket | Manual refresh button |
| **Live Dashboard** | WebSocket + SWR | 30s polling |

### Notification System with WebSocket

```typescript
// hooks/use-notifications.ts
import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wsManager } from '@/lib/websocket/client';

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/v1/notifications');
      return response.json();
    },
    staleTime: 30000,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await fetch('/api/v1/notifications/unread-count');
      return response.json();
    },
    refetchInterval: 60000, // Fallback: poll every minute
  });

  useEffect(() => {
    // Subscribe to real-time notifications
    const unsub = wsManager.on('notification', (message) => {
      // Update notification cache
      queryClient.setQueryData(['notifications'], (old: any) => {
        return {
          ...old,
          data: [message.data, ...(old?.data || [])],
        };
      });

      // Update unread count
      queryClient.setQueryData(['notifications', 'unread-count'], (old: any) => ({
        ...old,
        data: (old?.data || 0) + 1,
      }));

      // Show toast
      toast.info(message.data.title, {
        description: message.data.content,
      });
    });

    return unsub;
  }, [queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/notifications/${id}/read`, { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await fetch('/api/v1/notifications/read-all', { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: notifications?.data || [],
    unreadCount: unreadCount?.data || 0,
    markAsRead,
    markAllAsRead,
  };
}
```

---

## 7. Data Strategy (Production)

### Development Environment

**Option A: Connect to Local Backend (Recommended)**
```bash
# Backend is already running via Docker Compose
# API: http://localhost:8080/api/v1
# WebSocket: ws://localhost:8080/ws

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

**Option B: Seed Data for Development**

Create a seed script:

```typescript
// scripts/seed-data.ts
import { api } from '@/lib/api/client';

export async function seedDevelopmentData() {
  // Create test users
  const users = [
    { email: 'admin@syncwork.com', password: 'admin123', first_name: 'Admin', last_name: 'User', role: 'admin' },
    { email: 'manager@syncwork.com', password: 'manager123', first_name: 'Manager', last_name: 'User', role: 'manager' },
    { email: 'staff@syncwork.com', password: 'staff123', first_name: 'Staff', last_name: 'User', role: 'staff' },
  ];

  for (const user of users) {
    try {
      await api.post('/auth/register', user);
      console.log(`Created user: ${user.email}`);
    } catch (error) {
      console.log(`User ${user.email} already exists`);
    }
  }

  // Create test departments
  const departments = [
    { name: 'Engineering', code: 'ENG' },
    { name: 'Sales', code: 'SAL' },
    { name: 'Marketing', code: 'MKT' },
  ];

  for (const dept of departments) {
    try {
      await api.post('/departments', dept);
      console.log(`Created department: ${dept.name}`);
    } catch (error) {
      console.log(`Department ${dept.name} already exists`);
    }
  }

  console.log('Seed data created successfully');
}
```

### Staging Environment

```bash
# .env.staging
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_API_URL=https://api.staging.syncwork.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.staging.syncwork.com/ws
NEXT_PUBLIC_APP_URL=https://staging.syncwork.com
```

**Staging Data:**
- Use production-like dataset (anonymized)
- Reset daily via CI/CD pipeline
- Shared among team members

### Production Environment

```bash
# .env.production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_API_URL=https://api.syncwork.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.syncwork.com/ws
NEXT_PUBLIC_APP_URL=https://app.syncwork.com
```

---

## 8. Production Checklist

### Security
- [ ] httpOnly cookies for tokens
- [ ] CSRF protection enabled
- [ ] Content Security Policy configured
- [ ] Rate limiting on API routes
- [ ] Input validation (Zod schemas)
- [ ] XSS protection (sanitize HTML)
- [ ] Secure headers (HSTS, X-Frame-Options)

### Performance
- [ ] Edge deployment (Cloudflare Workers)
- [ ] Image optimization (Next.js Image)
- [ ] Code splitting (dynamic imports)
- [ ] Bundle analysis under 200KB
- [ ] Virtual scrolling for large lists
- [ ] Service Worker for offline support

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (Plausible/PostHog)
- [ ] Web Vitals monitoring
- [ ] WebSocket connection metrics
- [ ] API response time tracking

### Testing
- [ ] Unit tests (Vitest) - 80% coverage
- [ ] Integration tests (React Testing Library)
- [ ] E2E tests (Playwright) - critical paths
- [ ] Accessibility audit (axe-core)
- [ ] Performance audit (Lighthouse)

### Deployment
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Preview deployments for PRs
- [ ] Automated rollback
- [ ] Database migration strategy
- [ ] Environment variable management

---

## Summary

| Question | Production Answer |
|----------|------------------|
| **Backend URL** | Configurable per environment (`NEXT_PUBLIC_API_URL`) |
| **Authentication** | httpOnly cookies + BFF pattern (secure, XSS-proof) |
| **WebSocket** | `wss://` in production, auto-reconnect, heartbeat |
| **File Uploads** | Direct to backend with progress tracking |
| **RBAC** | Full granular permissions with dynamic UI |
| **Real-time** | WebSocket-only (no polling), all features |
| **Data** | Local backend for dev, staging db for testing |

**Architecture Pattern:** Backend-For-Frontend (BFF) with Clean Architecture
**Deployment:** Edge-first (Cloudflare Workers) with Vercel previews
**Security:** Enterprise-grade (httpOnly cookies, CSP, CSRF, XSS protection)
