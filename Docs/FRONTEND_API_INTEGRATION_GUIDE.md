# SyncWork Frontend API Integration Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Base Configuration](#base-configuration)
3. [Authentication](#authentication)
4. [TypeScript Types](#typescript-types)
5. [Tanstack Query Setup](#tanstack-query-setup)
6. [API Integration by Domain](#api-integration-by-domain)
7. [Error Handling](#error-handling)
8. [Common Patterns](#common-patterns)

---

## Getting Started

### Prerequisites
- Next.js 16+ with TypeScript
- Axios for HTTP requests
- Tanstack Query (React Query) for server state
- Zustand for client state
- shadcn/ui components

### Environment Variables
Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME="SyncWork"
```

---

## Base Configuration

### Axios Instance Setup
```typescript
// lib/axios.ts
import axios, { AxiosError, AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
        // Logout user
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

### Auth Store (Zustand)
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

### Auth Service
```typescript
// services/auth.ts
import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
```

### Auth Query Hooks
```typescript
// hooks/use-auth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/auth-store';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.data);
      // Store in localStorage for axios interceptor
      localStorage.setItem('access_token', data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
    },
  });
};

export const useGetMe = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await authService.getMe();
      return response.data;
    },
    enabled: isAuthenticated,
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      queryClient.clear();
    },
  });
};
```

---

## TypeScript Types

```typescript
// types/index.ts

// User Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'pending' | 'suspended' | 'terminated';
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

// Staff Types
export interface Employee {
  id: string;
  user_id: string;
  employee_code: string;
  department_id?: string;
  manager_id?: string;
  hire_date: string;
  job_title: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern' | 'freelance';
  status: string;
  salary?: number;
  currency: string;
  address?: string;
  city?: string;
  country?: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  parent_id?: string;
  manager_id?: string;
  description?: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  manager_id: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  end_date?: string;
  budget?: number;
  pipeline_id?: string;
  tags: string[];
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  parent_id?: string;
  stage_id?: string;
  created_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed';
  velocity?: number;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'achieved' | 'missed';
  deliverables?: string[];
  created_at: string;
}

// Client Types
export interface Client {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  address?: string;
  tax_id?: string;
  status: 'active' | 'inactive' | 'prospect';
  account_manager_id?: string;
  notes?: string;
  created_at: string;
}

// Financial Types
export interface Expense {
  id: string;
  employee_id: string;
  category: string;
  amount: number;
  description?: string;
  receipt_url?: string;
  incurred_at: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  project_id: string;
  name: string;
  total_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'closed';
  created_at: string;
}

// Communication Types
export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'project';
  project_id?: string;
  created_by: string;
  member_count?: number;
  unread_count?: number;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'file' | 'system';
  parent_id?: string;
  edited_at?: string;
  reactions?: Reaction[];
  created_at: string;
}

export interface Reaction {
  emoji: string;
  user_id: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'company' | 'department' | 'project';
  scope_id?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  published_by: string;
  published_at: string;
  expires_at?: string;
  is_pinned: boolean;
  acknowledged_count: number;
  is_acknowledged?: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// Culture Types
export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'hackathon' | 'game_night' | 'team_building' | 'party';
  start_date: string;
  end_date: string;
  location?: string;
  max_participants?: number;
  organizer_id: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  banner_url?: string;
  created_at: string;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  type: 'single_choice' | 'multiple_choice' | 'rating';
  end_date?: string;
  created_by: string;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
}

export interface Recognition {
  id: string;
  from_user_id: string;
  to_user_id: string;
  type: 'kudos' | 'award' | 'milestone';
  message: string;
  points: number;
  created_at: string;
}
```

---

## Tanstack Query Setup

### Query Client Configuration
```typescript
// providers/query-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## API Integration by Domain

### 1. Users & RBAC

```typescript
// services/users.ts
import api from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { User, Role, Permission } from '@/types';

export const userService = {
  // Get all users
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/users', { params });
    return response.data as PaginatedResponse<User>;
  },

  // Get user by ID
  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data as ApiResponse<User>;
  },

  // Update user
  updateUser: async (id: string, data: Partial<User>) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data as ApiResponse<User>;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Change password
  changePassword: async (id: string, data: { current_password: string; new_password: string }) => {
    const response = await api.put(`/users/${id}/password`, data);
    return response.data;
  },

  // Assign role
  assignRole: async (userId: string, roleId: string) => {
    const response = await api.post(`/users/${userId}/roles`, { role_id: roleId });
    return response.data;
  },
};

// hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/users';

export const useUsers = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// services/roles.ts
import api from '@/lib/axios';

export const roleService = {
  getRoles: async () => {
    const response = await api.get('/roles');
    return response.data as PaginatedResponse<Role>;
  },

  createRole: async (data: Partial<Role>) => {
    const response = await api.post('/roles', data);
    return response.data as ApiResponse<Role>;
  },

  getPermissions: async () => {
    const response = await api.get('/permissions');
    return response.data as PaginatedResponse<Permission>;
  },
};

// hooks/use-roles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getRoles(),
  });
};

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => roleService.getPermissions(),
  });
};
```

### 2. Staff & HR

```typescript
// services/staff.ts
import api from '@/lib/axios';
import { Employee, Department, Attendance, LeaveRequest } from '@/types';

export const staffService = {
  // Employees
  getEmployees: async (params?: { page?: number; limit?: number; department_id?: string }) => {
    const response = await api.get('/staff', { params });
    return response.data;
  },

  getEmployee: async (id: string) => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },

  createEmployee: async (data: Partial<Employee>) => {
    const response = await api.post('/staff', data);
    return response.data;
  },

  updateEmployee: async (id: string, data: Partial<Employee>) => {
    const response = await api.put(`/staff/${id}`, data);
    return response.data;
  },

  // Departments
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  createDepartment: async (data: Partial<Department>) => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  // Attendance
  checkIn: async (data: { employee_id: string; notes?: string }) => {
    const response = await api.post('/attendance/check-in', data);
    return response.data;
  },

  checkOut: async (data: { employee_id: string; notes?: string }) => {
    const response = await api.post('/attendance/check-out', data);
    return response.data;
  },

  getMyAttendance: async () => {
    const response = await api.get('/attendance/my');
    return response.data;
  },

  // Leaves
  getLeaves: async () => {
    const response = await api.get('/leaves');
    return response.data;
  },

  createLeave: async (data: Partial<LeaveRequest>) => {
    const response = await api.post('/leaves', data);
    return response.data;
  },

  approveLeave: async (id: string) => {
    const response = await api.put(`/leaves/${id}/approve`);
    return response.data;
  },

  rejectLeave: async (id: string, reason: string) => {
    const response = await api.put(`/leaves/${id}/reject`, { reason });
    return response.data;
  },
};

// hooks/use-staff.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => staffService.getEmployees(),
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffService.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => staffService.getDepartments(),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffService.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useAttendance = () => {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: () => staffService.getMyAttendance(),
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};

export const useLeaves = () => {
  return useQuery({
    queryKey: ['leaves'],
    queryFn: () => staffService.getLeaves(),
  });
};
```

### 3. Project Management

```typescript
// services/projects.ts
import api from '@/lib/axios';
import { Project, Task, Sprint, Milestone } from '@/types';

export const projectService = {
  // Projects
  getProjects: async (params?: { status?: string; priority?: string }) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  getProject: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: Partial<Project>) => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Tasks
  getTasks: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  createTask: async (projectId: string, data: Partial<Task>) => {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  assignTask: async (taskId: string, assigneeId: string) => {
    const response = await api.post(`/tasks/${taskId}/assign`, { assignee_id: assigneeId });
    return response.data;
  },

  updateTaskStatus: async (taskId: string, status: string) => {
    const response = await api.post(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  // Sprints
  getSprints: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/sprints`);
    return response.data;
  },

  createSprint: async (projectId: string, data: Partial<Sprint>) => {
    const response = await api.post(`/projects/${projectId}/sprints`, data);
    return response.data;
  },

  startSprint: async (sprintId: string) => {
    const response = await api.post(`/sprints/${sprintId}/start`);
    return response.data;
  },

  completeSprint: async (sprintId: string) => {
    const response = await api.post(`/sprints/${sprintId}/complete`);
    return response.data;
  },

  // Milestones
  getMilestones: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/milestones`);
    return response.data;
  },

  createMilestone: async (projectId: string, data: Partial<Milestone>) => {
    const response = await api.post(`/projects/${projectId}/milestones`, data);
    return response.data;
  },

  // Pipelines
  getPipelines: async () => {
    const response = await api.get('/pipelines');
    return response.data;
  },

  createPipeline: async (data: { name: string; description?: string }) => {
    const response = await api.post('/pipelines', data);
    return response.data;
  },
};

// hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects(),
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useTasks = (projectId: string) => {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => projectService.getTasks(projectId),
    enabled: !!projectId,
  });
};

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Task>) => projectService.createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, assigneeId }: { taskId: string; assigneeId: string }) =>
      projectService.assignTask(taskId, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useSprints = (projectId: string) => {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => projectService.getSprints(projectId),
    enabled: !!projectId,
  });
};

export const usePipelines = () => {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: () => projectService.getPipelines(),
  });
};
```

### 4. Client & Financial

```typescript
// services/clients.ts
import api from '@/lib/axios';
import { Client, Expense, Budget } from '@/types';

export const clientService = {
  // Clients
  getClients: async () => {
    const response = await api.get('/clients');
    return response.data;
  },

  getClient: async (id: string) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  createClient: async (data: Partial<Client>) => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  updateClient: async (id: string, data: Partial<Client>) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  // Expenses
  getExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  getMyExpenses: async () => {
    const response = await api.get('/expenses/my');
    return response.data;
  },

  createExpense: async (data: Partial<Expense>) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  approveExpense: async (id: string) => {
    const response = await api.post(`/expenses/${id}/approve`);
    return response.data;
  },

  // Budgets
  getBudgets: async () => {
    const response = await api.get('/budgets');
    return response.data;
  },

  createBudget: async (data: Partial<Budget>) => {
    const response = await api.post('/budgets', data);
    return response.data;
  },
};

// hooks/use-clients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getClients(),
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientService.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => clientService.getExpenses(),
  });
};

export const useMyExpenses = () => {
  return useQuery({
    queryKey: ['my-expenses'],
    queryFn: () => clientService.getMyExpenses(),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', 'my-expenses'] });
    },
  });
};

export const useApproveExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientService.approveExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};
```

### 5. Communication

```typescript
// services/communication.ts
import api from '@/lib/axios';
import { ChatRoom, Message, Announcement, Notification } from '@/types';

export const communicationService = {
  // Chat Rooms
  getRooms: async () => {
    const response = await api.get('/chat/rooms');
    return response.data;
  },

  createRoom: async (data: { name: string; type: string; member_ids?: string[] }) => {
    const response = await api.post('/chat/rooms', data);
    return response.data;
  },

  joinRoom: async (roomId: string) => {
    const response = await api.post(`/chat/rooms/${roomId}/join`);
    return response.data;
  },

  getMessages: async (roomId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/chat/rooms/${roomId}/messages`, { params });
    return response.data;
  },

  sendMessage: async (roomId: string, data: { content: string; type?: string }) => {
    const response = await api.post(`/chat/rooms/${roomId}/messages`, data);
    return response.data;
  },

  // Announcements
  getAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },

  createAnnouncement: async (data: Partial<Announcement>) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },

  acknowledgeAnnouncement: async (id: string) => {
    const response = await api.post(`/announcements/${id}/acknowledge`);
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};

// hooks/use-communication.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: () => communicationService.getRooms(),
  });
};

export const useMessages = (roomId: string) => {
  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => communicationService.getMessages(roomId),
    enabled: !!roomId,
  });
};

export const useSendMessage = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string }) =>
      communicationService.sendMessage(roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    },
  });
};

export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () => communicationService.getAnnouncements(),
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => communicationService.getNotifications(),
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: () => communicationService.getUnreadCount(),
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: communicationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};
```

### 6. Culture & Events

```typescript
// services/culture.ts
import api from '@/lib/axios';
import { Event, Poll, Recognition } from '@/types';

export const cultureService = {
  // Events
  getEvents: async () => {
    const response = await api.get('/culture/events');
    return response.data;
  },

  createEvent: async (data: Partial<Event>) => {
    const response = await api.post('/culture/events', data);
    return response.data;
  },

  registerForEvent: async (eventId: string) => {
    const response = await api.post(`/culture/events/${eventId}/register`);
    return response.data;
  },

  // Polls
  getPolls: async () => {
    const response = await api.get('/culture/polls');
    return response.data;
  },

  createPoll: async (data: Partial<Poll> & { options: Array<{ text: string; order?: number }> }) => {
    const response = await api.post('/culture/polls', data);
    return response.data;
  },

  voteInPoll: async (pollId: string, optionId: string) => {
    const response = await api.post(`/culture/polls/${pollId}/vote`, { option_id: optionId });
    return response.data;
  },

  // Recognitions
  getRecognitions: async () => {
    const response = await api.get('/culture/recognitions');
    return response.data;
  },

  createRecognition: async (data: Partial<Recognition>) => {
    const response = await api.post('/culture/recognitions', data);
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await api.get('/culture/leaderboard');
    return response.data;
  },
};

// hooks/use-culture.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => cultureService.getEvents(),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cultureService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const usePolls = () => {
  return useQuery({
    queryKey: ['polls'],
    queryFn: () => cultureService.getPolls(),
  });
};

export const useVoteInPoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) =>
      cultureService.voteInPoll(pollId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => cultureService.getLeaderboard(),
  });
};
```

---

## Error Handling

### Global Error Handler
```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Hook
```typescript
// hooks/use-api-error.ts
import { useToast } from '@/components/ui/use-toast';
import { AxiosError } from 'axios';

export const useApiError = () => {
  const { toast } = useToast();

  const handleError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data;
      
      if (errorData?.error?.details) {
        // Validation errors
        errorData.error.details.forEach((detail: any) => {
          toast({
            title: 'Validation Error',
            description: `${detail.field}: ${detail.message}`,
            variant: 'destructive',
          });
        });
      } else {
        // General error
        toast({
          title: 'Error',
          description: errorData?.error?.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return { handleError };
};
```

---

## Common Patterns

### Loading States
```typescript
// components/loading-spinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}
```

### Empty State
```typescript
// components/empty-state.tsx
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  );
}
```

### Pagination Hook
```typescript
// hooks/use-pagination.ts
import { useState } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 20) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  return {
    page,
    limit,
    setPage,
    setLimit,
    offset: (page - 1) * limit,
  };
};
```

### Optimistic Updates
```typescript
// Example: Optimistic update for task status
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      projectService.updateTaskStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(['tasks']);

      // Optimistically update
      queryClient.setQueryData(['tasks'], (old: any) => ({
        ...old,
        data: old.data.map((task: Task) =>
          task.id === taskId ? { ...task, status } : task
        ),
      }));

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks'], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
```

---

## File Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── staff/
│   │   ├── projects/
│   │   ├── clients/
│   │   ├── communication/
│   │   └── culture/
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form components
│   ├── tables/          # Data table components
│   ├── modals/          # Modal/Dialog components
│   └── layout/          # Layout components
├── hooks/
│   ├── use-auth.ts
│   ├── use-users.ts
│   ├── use-staff.ts
│   ├── use-projects.ts
│   ├── use-clients.ts
│   ├── use-communication.ts
│   └── use-culture.ts
├── services/
│   ├── auth.ts
│   ├── users.ts
│   ├── staff.ts
│   ├── projects.ts
│   ├── clients.ts
│   ├── communication.ts
│   └── culture.ts
├── stores/
│   ├── auth-store.ts
│   └── ui-store.ts
├── types/
│   └── index.ts
├── lib/
│   ├── axios.ts
│   └── utils.ts
└── providers/
    └── query-provider.tsx
```

---

## Environment Setup

### Install Dependencies
```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add button card dialog form input label select table tabs toast

# Install additional dependencies
npm install axios @tanstack/react-query @tanstack/react-query-devtools zustand lucide-react

# Install form handling (optional)
npm install react-hook-form @hookform/resolvers zod
```

### Next.js Config
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## Support

- **Backend API**: http://localhost:8080/swagger/index.html
- **Repository**: https://github.com/asthrix/sync-work-server
- **Issues**: https://github.com/asthrix/sync-work-server/issues
