# SyncWork Frontend API Integration Guide

## Complete API Reference (194 Endpoints)

**Version:** 1.0.0
**Base URL:** `http://localhost:8080/api/v1`
**WebSocket:** `ws://localhost:8080/ws`
**Swagger UI:** `http://localhost:8080/swagger/index.html`

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [API Categories](#api-categories)
   - [Authentication & Users](#1-authentication--users)
   - [Staff & HR](#2-staff--hr)
   - [Projects & Tasks](#3-projects--tasks)
   - [Pipelines & Kanban](#4-pipelines--kanban)
   - [Clients & CRM](#5-clients--crm)
   - [Finance](#6-finance)
   - [Communication](#7-communication)
   - [Culture & Events](#8-culture--events)
   - [Audit & Compliance](#9-audit--compliance)
   - [File Upload](#10-file-upload)
   - [WebSocket](#11-websocket)
4. [TypeScript Types](#typescript-types)
5. [Tanstack Query Patterns](#tanstack-query-patterns)
6. [Error Handling](#error-handling)

---

## Quick Start

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_APP_NAME="SyncWork"
```

### Axios Configuration
```typescript
// lib/axios.ts
import axios, { AxiosError, AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Request-ID': crypto.randomUUID(),
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token } = response.data.data;
        localStorage.setItem('access_token', access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### API Response Types
```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  meta: {
    timestamp: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

---

## Authentication

### Zustand Auth Store
```typescript
// stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (tokens: { access_token: string; refresh_token: string }) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (tokens) =>
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
        }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    { name: 'auth-storage' }
  )
);
```

---

## API Categories

### 1. Authentication & Users

#### Authentication Endpoints (7)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login user |
| GET | `/auth/me` | Yes | Get current user |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Logout user |
| POST | `/auth/password-reset` | No | Request password reset |
| POST | `/auth/password-reset/confirm` | No | Confirm password reset |

```typescript
// services/auth.ts
export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
  logout: () => api.post('/auth/logout'),
  passwordReset: (email: string) =>
    api.post('/auth/password-reset', { email }),
  passwordResetConfirm: (data: { token: string; new_password: string }) =>
    api.post('/auth/password-reset/confirm', data),
};
```

#### Users Endpoints (6)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Yes | List all users |
| GET | `/users/:id` | Yes | Get user by ID |
| PUT | `/users/:id` | Yes | Update user |
| DELETE | `/users/:id` | Yes | Delete user |
| PUT | `/users/:id/password` | Yes | Change password |
| POST | `/users/:id/roles` | Yes | Assign role |
| DELETE | `/users/:id/roles/:role_id` | Yes | Remove role |

#### Roles & Permissions (6)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/roles` | Yes | List roles |
| POST | `/roles` | Yes | Create role |
| GET | `/roles/:id` | Yes | Get role |
| PUT | `/roles/:id` | Yes | Update role |
| DELETE | `/roles/:id` | Yes | Delete role |
| GET | `/permissions` | Yes | List permissions |
| POST | `/permissions` | Yes | Create permission |

---

### 2. Staff & HR

#### Staff Management (9)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/staff` | Yes | List staff |
| POST | `/staff` | Yes | Create staff |
| GET | `/staff/:id` | Yes | Get staff |
| PUT | `/staff/:id` | Yes | Update staff |
| DELETE | `/staff/:id` | Yes | Delete staff |
| GET | `/staff/search` | Yes | Search staff |
| GET | `/staff/org-chart` | Yes | Get org chart |
| GET | `/staff/:id/documents` | Yes | Get documents |
| POST | `/staff/:id/documents` | Yes | Create document |

#### Departments (6)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/departments` | Yes | List departments |
| POST | `/departments` | Yes | Create department |
| GET | `/departments/:id` | Yes | Get department |
| PUT | `/departments/:id` | Yes | Update department |
| DELETE | `/departments/:id` | Yes | Delete department |
| GET | `/departments/:id/staff` | Yes | Get department staff |

#### Attendance (4)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/attendance` | Yes | List attendance |
| POST | `/attendance/check-in` | Yes | Check in |
| POST | `/attendance/check-out` | Yes | Check out |
| GET | `/attendance/my` | Yes | My attendance |
| GET | `/attendance/reports` | Yes | Attendance reports |

#### Leaves (6)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/leaves` | Yes | List leaves |
| POST | `/leaves` | Yes | Create leave |
| GET | `/leaves/:id` | Yes | Get leave |
| GET | `/leaves/types` | Yes | Get leave types |
| GET | `/leaves/balance` | Yes | Get leave balance |
| PUT | `/leaves/:id/approve` | Yes | Approve leave |
| PUT | `/leaves/:id/reject` | Yes | Reject leave |

#### Performance Reviews (3)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/performance-reviews` | Yes | List reviews |
| POST | `/performance-reviews` | Yes | Create review |
| GET | `/performance-reviews/:id` | Yes | Get review |
| PUT | `/performance-reviews/:id` | Yes | Update review |

---

### 3. Projects & Tasks

#### Projects (13)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/projects` | Yes | List projects |
| POST | `/projects` | Yes | Create project |
| GET | `/projects/templates` | Yes | Get templates |
| GET | `/projects/:id` | Yes | Get project |
| PUT | `/projects/:id` | Yes | Update project |
| DELETE | `/projects/:id` | Yes | Delete project |
| GET | `/projects/:id/members` | Yes | Get members |
| POST | `/projects/:id/members` | Yes | Add member |
| DELETE | `/projects/:id/members/:userId` | Yes | Remove member |
| GET | `/projects/:id/timeline` | Yes | Get timeline |
| GET | `/projects/:id/budget` | Yes | Get budget |
| GET | `/projects/:id/tasks` | Yes | Get tasks |
| POST | `/projects/:id/tasks` | Yes | Create task |
| GET | `/projects/:id/sprints` | Yes | Get sprints |
| POST | `/projects/:id/sprints` | Yes | Create sprint |
| GET | `/projects/:id/milestones` | Yes | Get milestones |
| POST | `/projects/:id/milestones` | Yes | Create milestone |

#### Tasks (7)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks/:id` | Yes | Get task |
| PUT | `/tasks/:id` | Yes | Update task |
| DELETE | `/tasks/:id` | Yes | Delete task |
| POST | `/tasks/:id/assign` | Yes | Assign task |
| POST | `/tasks/:id/status` | Yes | Update status |
| GET | `/tasks/:id/time-logs` | Yes | Get time logs |
| POST | `/tasks/:id/time-logs` | Yes | Log time |

#### Sprints (7)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sprints/:id` | Yes | Get sprint |
| PUT | `/sprints/:id` | Yes | Update sprint |
| DELETE | `/sprints/:id` | Yes | Delete sprint |
| POST | `/sprints/:id/start` | Yes | Start sprint |
| POST | `/sprints/:id/complete` | Yes | Complete sprint |
| GET | `/sprints/:id/burndown` | Yes | Get burndown |

#### Milestones (4)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/milestones/:id` | Yes | Get milestone |
| PUT | `/milestones/:id` | Yes | Update milestone |
| DELETE | `/milestones/:id` | Yes | Delete milestone |

---

### 4. Pipelines & Kanban

#### Pipelines (9)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/pipelines` | Yes | List pipelines |
| POST | `/pipelines` | Yes | Create pipeline |
| GET | `/pipelines/:id` | Yes | Get pipeline |
| PUT | `/pipelines/:id` | Yes | Update pipeline |
| DELETE | `/pipelines/:id` | Yes | Delete pipeline |
| GET | `/pipelines/:id/stages` | Yes | Get stages |
| POST | `/pipelines/:id/stages` | Yes | Create stage |
| POST | `/pipelines/:id/move-task` | Yes | Move task |
| GET | `/pipelines/:id/automations` | Yes | Get automations |
| POST | `/pipelines/:id/automations` | Yes | Create automation |

#### Stages (3)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/pipelines/stages/:id` | Yes | Update stage |
| DELETE | `/pipelines/stages/:id` | Yes | Delete stage |

#### Automations (4)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/automations/:id` | Yes | Get automation |
| PUT | `/automations/:id` | Yes | Update automation |
| DELETE | `/automations/:id` | Yes | Delete automation |

---

### 5. Clients & CRM

#### Clients (9)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/clients` | Yes | List clients |
| POST | `/clients` | Yes | Create client |
| GET | `/clients/:id` | Yes | Get client |
| PUT | `/clients/:id` | Yes | Update client |
| DELETE | `/clients/:id` | Yes | Delete client |
| GET | `/clients/:id/contacts` | Yes | Get contacts |
| POST | `/clients/:id/contacts` | Yes | Create contact |
| GET | `/clients/:id/projects` | Yes | Get projects |
| GET | `/clients/:id/contracts` | Yes | Get contracts |
| GET | `/clients/:id/invoices` | Yes | Get invoices |

#### Contacts (4)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/contacts/:id` | Yes | Get contact |
| PUT | `/contacts/:id` | Yes | Update contact |
| DELETE | `/contacts/:id` | Yes | Delete contact |

#### Contracts (7)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/contracts` | Yes | List contracts |
| POST | `/contracts` | Yes | Create contract |
| GET | `/contracts/:id` | Yes | Get contract |
| PUT | `/contracts/:id` | Yes | Update contract |
| DELETE | `/contracts/:id` | Yes | Delete contract |
| POST | `/contracts/:id/renew` | Yes | Renew contract |
| POST | `/contracts/:id/terminate` | Yes | Terminate contract |

#### Proposals (4)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/proposals` | Yes | List proposals |
| POST | `/proposals` | Yes | Create proposal |
| GET | `/proposals/:id` | Yes | Get proposal |
| PUT | `/proposals/:id` | Yes | Update proposal |
| DELETE | `/proposals/:id` | Yes | Delete proposal |

#### Tickets (8)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tickets` | Yes | List tickets |
| POST | `/tickets` | Yes | Create ticket |
| GET | `/tickets/:id` | Yes | Get ticket |
| PUT | `/tickets/:id` | Yes | Update ticket |
| POST | `/tickets/:id/assign` | Yes | Assign ticket |
| POST | `/tickets/:id/resolve` | Yes | Resolve ticket |
| GET | `/tickets/:id/comments` | Yes | Get comments |
| POST | `/tickets/:id/comments` | Yes | Create comment |

---

### 6. Finance

#### Payroll (9)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/payroll` | Yes | List payroll |
| POST | `/payroll/generate` | Yes | Generate payroll |
| GET | `/payroll/:id` | Yes | Get payroll |
| PUT | `/payroll/:id` | Yes | Update payroll |
| POST | `/payroll/:id/process` | Yes | Process payroll |
| POST | `/payroll/:id/publish` | Yes | Publish payroll |
| GET | `/payroll/:id/payslips` | Yes | Get payslips |
| GET | `/payroll/my` | Yes | My payroll |
| GET | `/payroll/my/payslips/:id/download` | Yes | Download payslip |

#### Salary Structures (5)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/salary-structures` | Yes | List structures |
| POST | `/salary-structures` | Yes | Create structure |
| GET | `/salary-structures/:id` | Yes | Get structure |
| PUT | `/salary-structures/:id` | Yes | Update structure |
| DELETE | `/salary-structures/:id` | Yes | Delete structure |

#### Expenses (8)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/expenses` | Yes | List expenses |
| POST | `/expenses` | Yes | Create expense |
| GET | `/expenses/:id` | Yes | Get expense |
| PUT | `/expenses/:id` | Yes | Update expense |
| DELETE | `/expenses/:id` | Yes | Delete expense |
| POST | `/expenses/:id/approve` | Yes | Approve expense |
| POST | `/expenses/:id/reject` | Yes | Reject expense |
| GET | `/expenses/my` | Yes | My expenses |

#### Budgets (7)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/budgets` | Yes | List budgets |
| POST | `/budgets` | Yes | Create budget |
| GET | `/budgets/:id` | Yes | Get budget |
| PUT | `/budgets/:id` | Yes | Update budget |
| DELETE | `/budgets/:id` | Yes | Delete budget |
| GET | `/budgets/:id/transactions` | Yes | Get transactions |
| POST | `/budgets/:id/transactions` | Yes | Create transaction |

---

### 7. Communication

#### Chat Rooms (13)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/chat/rooms` | Yes | List rooms |
| POST | `/chat/rooms` | Yes | Create room |
| GET | `/chat/rooms/:id` | Yes | Get room |
| PUT | `/chat/rooms/:id` | Yes | Update room |
| DELETE | `/chat/rooms/:id` | Yes | Delete room |
| POST | `/chat/rooms/:id/join` | Yes | Join room |
| POST | `/chat/rooms/:id/leave` | Yes | Leave room |
| GET | `/chat/rooms/:id/messages` | Yes | Get messages |
| POST | `/chat/rooms/:id/messages` | Yes | Send message |
| GET | `/chat/rooms/:id/messages/:messageId/thread` | Yes | Get thread |
| POST | `/chat/rooms/:id/read` | Yes | Mark as read |
| GET | `/chat/search` | Yes | Search messages |

#### Messages (3)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/chat/messages/:id` | Yes | Edit message |
| DELETE | `/chat/messages/:id` | Yes | Delete message |
| POST | `/chat/messages/:id/reactions` | Yes | Add reaction |

#### Announcements (8)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/announcements` | Yes | List announcements |
| POST | `/announcements` | Yes | Create announcement |
| GET | `/announcements/:id` | Yes | Get announcement |
| PUT | `/announcements/:id` | Yes | Update announcement |
| DELETE | `/announcements/:id` | Yes | Delete announcement |
| POST | `/announcements/:id/pin` | Yes | Pin announcement |
| POST | `/announcements/:id/acknowledge` | Yes | Acknowledge |
| GET | `/announcements/:id/acknowledgements` | Yes | Get acknowledgements |

#### Notifications (8)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Yes | List notifications |
| GET | `/notifications/unread-count` | Yes | Get unread count |
| PUT | `/notifications/:id/read` | Yes | Mark as read |
| PUT | `/notifications/read-all` | Yes | Mark all read |
| DELETE | `/notifications/:id` | Yes | Delete notification |
| GET | `/notifications/preferences` | Yes | Get preferences |
| PUT | `/notifications/preferences` | Yes | Update preferences |

---

### 8. Culture & Events

#### Events (10)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/culture/events` | Yes | List events |
| POST | `/culture/events` | Yes | Create event |
| GET | `/culture/events/:id` | Yes | Get event |
| PUT | `/culture/events/:id` | Yes | Update event |
| DELETE | `/culture/events/:id` | Yes | Delete event |
| GET | `/culture/events/:id/participants` | Yes | Get participants |
| POST | `/culture/events/:id/register` | Yes | Register |
| DELETE | `/culture/events/:id/register/:user_id` | Yes | Cancel registration |
| GET | `/culture/events/:id/gallery` | Yes | Get gallery |
| POST | `/culture/events/:id/gallery` | Yes | Add gallery item |

#### Trips (9)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/culture/trips` | Yes | List trips |
| POST | `/culture/trips` | Yes | Create trip |
| GET | `/culture/trips/:id` | Yes | Get trip |
| PUT | `/culture/trips/:id` | Yes | Update trip |
| DELETE | `/culture/trips/:id` | Yes | Delete trip |
| GET | `/culture/trips/:id/participants` | Yes | Get participants |
| POST | `/culture/trips/:id/register` | Yes | Register |
| GET | `/culture/trips/:id/itinerary` | Yes | Get itinerary |
| POST | `/culture/trips/:id/itinerary` | Yes | Add itinerary item |

#### Polls (7)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/culture/polls` | Yes | List polls |
| POST | `/culture/polls` | Yes | Create poll |
| GET | `/culture/polls/:id` | Yes | Get poll |
| GET | `/culture/polls/:id/options` | Yes | Get options |
| GET | `/culture/polls/:id/results` | Yes | Get results |
| POST | `/culture/polls/:id/vote` | Yes | Vote |

#### Recognitions (5)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/culture/recognitions` | Yes | List recognitions |
| POST | `/culture/recognitions` | Yes | Create recognition |
| GET | `/culture/recognitions/:id` | Yes | Get recognition |
| GET | `/culture/leaderboard` | Yes | Get leaderboard |

---

### 9. Audit & Compliance

#### Audit Logs (6)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/audit-logs` | Yes | List audit logs |
| GET | `/audit-logs/:id` | Yes | Get audit log |
| GET | `/audit-logs/search` | Yes | Search audit logs |
| GET | `/audit-logs/export` | Yes | Export audit logs |
| GET | `/audit-logs/stats` | Yes | Get audit stats |

#### Compliance (5)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/compliance/gdpr/export` | Yes | Export GDPR data |
| POST | `/compliance/gdpr/delete-request` | Yes | GDPR delete request |
| GET | `/compliance/retention-policies` | Yes | Get retention policies |
| PUT | `/compliance/retention-policies/:id` | Yes | Update retention policy |
| GET | `/compliance/reports` | Yes | Get compliance reports |

---

### 10. File Upload

#### Upload Endpoints (2)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/upload` | Yes | Upload file |
| GET | `/files/:folder/:filename` | No | Serve uploaded file |

```typescript
// services/upload.ts
export const uploadService = {
  uploadFile: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
};

// Usage
const handleUpload = async (file: File) => {
  const response = await uploadService.uploadFile(file, 'avatars');
  return response.data.data.url; // http://localhost:8080/files/avatars/filename.jpg
};
```

**Supported File Types:**
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, TXT, DOC, DOCX, XLS, XLSX
- Max Size: 10MB

---

### 11. WebSocket

#### Connection
```javascript
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

ws.onopen = () => {
  console.log('WebSocket connected');
  
  // Join a room
  ws.send(JSON.stringify({
    type: 'join_room',
    room_id: 'room-uuid-here'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'chat':
      // Handle chat message
      console.log('New message:', message.content);
      break;
    case 'notification':
      // Handle notification
      toast.info(message.data.title);
      break;
    case 'presence':
      // Handle user presence
      console.log('User status:', message.data.status);
      break;
    case 'typing':
      // Handle typing indicator
      showTypingIndicator(message.sender_id);
      break;
  }
};

ws.onclose = () => {
  console.log('WebSocket disconnected');
  // Auto-reconnect logic
};
```

#### Message Types
| Type | Direction | Description |
|------|-----------|-------------|
| `chat` | Bidirectional | Chat messages |
| `notification` | Server → Client | System notifications |
| `presence` | Bidirectional | User online/offline/away/busy |
| `typing` | Client → Server | Typing indicators |
| `join_room` | Client → Server | Join a chat room |
| `leave_room` | Client → Server | Leave a chat room |
| `ping` | Client → Server | Heartbeat ping |
| `pong` | Server → Client | Heartbeat pong |

---

## TypeScript Types

### Updated Types (with roles)
```typescript
// types/index.ts

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'pending' | 'suspended' | 'terminated';
  roles: string[]; // NEW: Roles from JWT
  mfa_enabled: boolean;
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  created_at: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: string;
  description?: string;
}

// ... (rest of types remain the same)
```

---

## Tanstack Query Patterns

### Service Pattern
```typescript
// services/[domain].ts
import api from '@/lib/axios';

export const domainService = {
  list: (params?: any) => api.get('/endpoint', { params }),
  get: (id: string) => api.get(`/endpoint/${id}`),
  create: (data: any) => api.post('/endpoint', data),
  update: (id: string, data: any) => api.put(`/endpoint/${id}`, data),
  delete: (id: string) => api.delete(`/endpoint/${id}`),
};
```

### Hook Pattern
```typescript
// hooks/use-[domain].ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { domainService } from '@/services/[domain]';

export const useDomainList = (params?: any) =>
  useQuery({
    queryKey: ['domain', params],
    queryFn: () => domainService.list(params).then(r => r.data),
  });

export const useDomainCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: domainService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['domain'] }),
  });
};
```

---

## Error Handling

### Standard Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `TOKEN_EXPIRED` | 401 | JWT token expired |
| `TOKEN_INVALID` | 401 | Invalid JWT token |
| `UNAUTHORIZED` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |
| `INVALID_FILE_TYPE` | 400 | Unsupported file type |

---

## Swagger Documentation Status

**Total Endpoints:** 194
**Swagger Documented:** ~168 (86.6%)
**Missing Swagger Docs:**
- Upload handler (new - needs @Router annotations)
- Some utility endpoints

**To view Swagger:**
```
http://localhost:8080/swagger/index.html
```

---

## Quick Reference

### Auth Headers
```
Authorization: Bearer <token>
X-Request-ID: <uuid>
```

### Pagination Params
```
?page=1&limit=20&sort=-created_at
```

### Search Params
```
?search=query&status=active&department_id=uuid
```

### File Upload
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'avatars');

api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## Support

- **Backend API:** http://localhost:8080/swagger/index.html
- **Repository:** https://github.com/asthrix/sync-work-server
- **Issues:** https://github.com/asthrix/sync-work-server/issues
