# SyncWork Frontend API Integration Guide

> **Companion Document:** [API Schemas Reference](./API_SCHEMAS.md) - Complete request/response schemas for all 194 endpoints

## Table of Contents
- [Overview](#overview)
- [Authentication & TanStack Query Setup](#authentication--tanstack-query-setup)
- [1. Authentication](#1-authentication)
- [2. User Management](#2-user-management)
- [3. Roles & Permissions (RBAC)](#3-roles--permissions-rbac)
- [4. Staff Management](#4-staff-management)
- [5. Departments](#5-departments)
- [6. Attendance](#6-attendance)
- [7. Leave Management](#7-leave-management)
- [8. Performance Reviews](#8-performance-reviews)
- [9. Projects](#9-projects)
- [10. Tasks](#10-tasks)
- [11. Sprints](#11-sprints)
- [12. Milestones](#12-milestones)
- [13. Pipelines (Kanban)](#13-pipelines-kanban)
- [14. Automations](#14-automations)
- [15. Chat](#15-chat)
- [16. Announcements](#16-announcements)
- [17. Notifications](#17-notifications)
- [18. Culture (Events, Trips, Polls)](#18-culture-events-trips-polls)
- [19. Clients & CRM](#19-clients--crm)
- [20. Finance](#20-finance)
- [21. Audit & Compliance](#21-audit--compliance)
- [22. File Upload](#22-file-upload)
- [23. WebSocket](#23-websocket)
- [UI Design System](#ui-design-system)

---

## Overview

**Base URL:** `http://localhost:8080/api/v1`  
**WebSocket:** `ws://localhost:8080/ws`  
**Swagger UI:** `http://localhost:8080/swagger/index.html`

### Tech Stack
- **React 18+** with TypeScript
- **TanStack Query (React Query)** for server state management
- **Axios** for HTTP requests
- **Tailwind CSS** + **shadcn/ui** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Zustand** for client state management

---

## Authentication & TanStack Query Setup

### Axios Instance with Interceptors

```typescript
// lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 & refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post('/auth/refresh', { refresh_token: refreshToken });
        useAuthStore.getState().setTokens(data.data.access_token, data.data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${data.data.access_token}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### TanStack Query Provider Setup

```typescript
// providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 1. Authentication

### UI Section: Auth Pages
**Design:** Minimalist, centered cards with subtle gradient backgrounds. Clean typography with generous whitespace. Floating input labels with smooth focus animations.

```typescript
// hooks/useAuth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => api.post('/auth/login', data),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => api.post('/auth/register', data),
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((res) => res.data.data),
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (refreshToken: string) => 
      api.post('/auth/refresh', { refresh_token: refreshToken }),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
  });
};

export const usePasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => api.post('/auth/password-reset', { email }),
  });
};

export const usePasswordResetConfirm = () => {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) => 
      api.post('/auth/password-reset/confirm', data),
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| POST | `/auth/register` | No | `useRegister()` |
| POST | `/auth/login` | No | `useLogin()` |
| GET | `/auth/me` | Yes | `useMe()` |
| POST | `/auth/refresh` | No | `useRefreshToken()` |
| POST | `/auth/logout` | Yes | `useLogout()` |
| POST | `/auth/password-reset` | No | `usePasswordReset()` |
| POST | `/auth/password-reset/confirm` | No | `usePasswordResetConfirm()` |

### UI Components Needed
- `LoginPage` - Centered card with email/password, "Forgot Password" link
- `RegisterPage` - Multi-step form with validation
- `ForgotPasswordPage` - Email input with success state
- `ResetPasswordPage` - New password confirmation

---

## 2. User Management

### UI Section: User Directory & Profile
**Design:** Directory-style grid with hover cards. Profile pages with cover photos, stat cards, and activity timelines. Admin panel with data tables featuring sortable columns and batch actions.

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'pending' | 'inactive';
}

interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export const useUsers = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => api.get(`/users?page=${page}&limit=${limit}`).then((res) => res.data),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/users/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => 
      api.put(`/users/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => 
      api.put(`/users/${id}/password`, { password }),
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) => 
      api.post(`/users/${userId}/roles`, { role_id: roleId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
};

export const useRemoveRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) => 
      api.delete(`/users/${userId}/roles/${roleId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/users` | Yes | `useUsers()` |
| GET | `/users/:id` | Yes | `useUser(id)` |
| PUT | `/users/:id` | Yes | `useUpdateUser()` |
| DELETE | `/users/:id` | Yes | `useDeleteUser()` |
| PUT | `/users/:id/password` | Yes | `useChangePassword()` |
| POST | `/users/:id/roles` | Yes | `useAssignRole()` |
| DELETE | `/users/:id/roles/:role_id` | Yes | `useRemoveRole()` |

### UI Components Needed
- `UsersPage` - Data table with search, filters, pagination
- `UserProfilePage` - Profile view with edit modal
- `UserSettingsPage` - Password change, preferences

---

## 3. Roles & Permissions (RBAC)

### UI Section: Access Control Panel
**Design:** Permission matrix grid with toggle switches. Role cards with colored badges. Tree-view for permission hierarchy.

```typescript
// hooks/useRoles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: string;
}

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/roles').then((res) => res.data.data),
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Role>) => api.post('/roles', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) => 
      api.put(`/roles/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/roles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
};

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => api.get('/permissions').then((res) => res.data.data),
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Permission>) => api.post('/permissions', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['permissions'] }),
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/roles` | Yes | `useRoles()` |
| POST | `/roles` | Yes | `useCreateRole()` |
| GET | `/roles/:id` | Yes | `useRole(id)` |
| PUT | `/roles/:id` | Yes | `useUpdateRole()` |
| DELETE | `/roles/:id` | Yes | `useDeleteRole()` |
| GET | `/permissions` | Yes | `usePermissions()` |
| POST | `/permissions` | Yes | `useCreatePermission()` |

### UI Components Needed
- `RolesPage` - Role management with permission assignment
- `PermissionsPage` - Permission grid/matrix
- `RoleAssignmentModal` - Assign roles to users

---

## 4. Staff Management

### UI Section: Team Directory & HR Dashboard
**Design:** Org chart visualization with D3.js. Employee cards with hover effects. Timeline view for documents. Clean HR admin interface with tabs.

```typescript
// hooks/useStaff.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface StaffMember {
  id: string;
  user_id: string;
  department_id?: string;
  position: string;
  employee_id: string;
  hire_date: string;
}

export const useStaff = () => {
  return useQuery({
    queryKey: ['staff'],
    queryFn: () => api.get('/staff').then((res) => res.data.data),
  });
};

export const useSearchStaff = (query: string) => {
  return useQuery({
    queryKey: ['staff', 'search', query],
    queryFn: () => api.get(`/staff/search?q=${query}`).then((res) => res.data.data),
    enabled: query.length > 2,
  });
};

export const useOrgChart = () => {
  return useQuery({
    queryKey: ['staff', 'org-chart'],
    queryFn: () => api.get('/staff/org-chart').then((res) => res.data.data),
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StaffMember>) => api.post('/staff', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffMember> }) => 
      api.put(`/staff/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/staff/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });
};

export const useStaffDocuments = (staffId: string) => {
  return useQuery({
    queryKey: ['staff', staffId, 'documents'],
    queryFn: () => api.get(`/staff/${staffId}/documents`).then((res) => res.data.data),
    enabled: !!staffId,
  });
};

export const useCreateStaffDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: FormData }) => 
      api.post(`/staff/${staffId}/documents`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId, 'documents'] });
    },
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/staff` | Yes | `useStaff()` |
| POST | `/staff` | Yes | `useCreateStaff()` |
| GET | `/staff/search` | Yes | `useSearchStaff()` |
| GET | `/staff/org-chart` | Yes | `useOrgChart()` |
| GET | `/staff/:id` | Yes | `useStaffMember(id)` |
| PUT | `/staff/:id` | Yes | `useUpdateStaff()` |
| DELETE | `/staff/:id` | Yes | `useDeleteStaff()` |
| GET | `/staff/:id/documents` | Yes | `useStaffDocuments()` |
| POST | `/staff/:id/documents` | Yes | `useCreateStaffDocument()` |

### UI Components Needed
- `StaffDirectoryPage` - Grid/list view with search
- `StaffProfilePage` - Detailed profile with documents
- `OrgChartPage` - Interactive organizational chart
- `StaffOnboardingModal` - Create new staff

---

## 5. Departments

### UI Section: Department Management
**Design:** Card-based layout with member avatars. Department tree visualization. Clean admin interface.

```typescript
// hooks/useDepartments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
}

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments').then((res) => res.data.data),
  });
};

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => api.get(`/departments/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useDepartmentStaff = (id: string) => {
  return useQuery({
    queryKey: ['department', id, 'staff'],
    queryFn: () => api.get(`/departments/${id}/staff`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Department>) => api.post('/departments', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) => 
      api.put(`/departments/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/departments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/departments` | Yes | `useDepartments()` |
| POST | `/departments` | Yes | `useCreateDepartment()` |
| GET | `/departments/:id` | Yes | `useDepartment(id)` |
| PUT | `/departments/:id` | Yes | `useUpdateDepartment()` |
| DELETE | `/departments/:id` | Yes | `useDeleteDepartment()` |
| GET | `/departments/:id/staff` | Yes | `useDepartmentStaff(id)` |

### UI Components Needed
- `DepartmentsPage` - Card grid with member counts
- `DepartmentDetailPage` - Department info + staff list

---

## 6. Attendance

### UI Section: Time Tracking Dashboard
**Design:** Calendar heatmap for attendance visualization. Clock-in/out buttons with large timer display. Stats cards with streak indicators.

```typescript
// hooks/useAttendance.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out?: string;
  status: 'present' | 'late' | 'absent';
}

export const useAttendance = (date?: string) => {
  return useQuery({
    queryKey: ['attendance', date],
    queryFn: () => api.get(`/attendance?date=${date || ''}`).then((res) => res.data.data),
  });
};

export const useMyAttendance = () => {
  return useQuery({
    queryKey: ['attendance', 'my'],
    queryFn: () => api.get('/attendance/my').then((res) => res.data.data),
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/attendance/check-in'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/attendance/check-out'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};

export const useAttendanceReports = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['attendance', 'reports', startDate, endDate],
    queryFn: () => 
      api.get(`/attendance/reports?start=${startDate}&end=${endDate}`).then((res) => res.data.data),
    enabled: !!startDate && !!endDate,
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/attendance` | Yes | `useAttendance()` |
| POST | `/attendance/check-in` | Yes | `useCheckIn()` |
| POST | `/attendance/check-out` | Yes | `useCheckOut()` |
| GET | `/attendance/reports` | Yes | `useAttendanceReports()` |
| GET | `/attendance/my` | Yes | `useMyAttendance()` |

### UI Components Needed
- `AttendanceDashboard` - Clock in/out, daily stats
- `AttendanceCalendar` - Monthly view with heatmap
- `AttendanceReports` - Admin reports with filters

---

## 7. Leave Management

### UI Section: Leave Portal
**Design:** Calendar view with leave types color-coded. Request form with date picker. Approval workflow with status badges.

```typescript
// hooks/useLeaves.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface LeaveRequest {
  id: string;
  user_id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export const useLeaves = (status?: string) => {
  return useQuery({
    queryKey: ['leaves', status],
    queryFn: () => api.get(`/leaves?status=${status || ''}`).then((res) => res.data.data),
  });
};

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: () => api.get('/leaves/types').then((res) => res.data.data),
  });
};

export const useLeaveBalance = () => {
  return useQuery({
    queryKey: ['leave-balance'],
    queryFn: () => api.get('/leaves/balance').then((res) => res.data.data),
  });
};

export const useCreateLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<LeaveRequest>) => api.post('/leaves', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
    },
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/leaves/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/leaves/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/leaves` | Yes | `useLeaves()` |
| POST | `/leaves` | Yes | `useCreateLeave()` |
| GET | `/leaves/types` | Yes | `useLeaveTypes()` |
| GET | `/leaves/balance` | Yes | `useLeaveBalance()` |
| GET | `/leaves/:id` | Yes | `useLeave(id)` |
| PUT | `/leaves/:id/approve` | Yes | `useApproveLeave()` |
| PUT | `/leaves/:id/reject` | Yes | `useRejectLeave()` |

### UI Components Needed
- `LeaveCalendar` - Visual calendar with leave blocks
- `LeaveRequestForm` - Date range, type, reason
- `LeaveApprovalQueue` - Manager approval dashboard
- `LeaveBalanceWidget` - Stats cards

---

## 8. Performance Reviews

### UI Section: Performance Dashboard
**Design:** Radar charts for skill assessment. Timeline of reviews. 360-degree feedback cards.

```typescript
// hooks/usePerformance.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface PerformanceReview {
  id: string;
  employee_id: string;
  reviewer_id: string;
  period: string;
  rating: number;
  status: 'draft' | 'submitted' | 'reviewed';
}

export const usePerformanceReviews = () => {
  return useQuery({
    queryKey: ['performance-reviews'],
    queryFn: () => api.get('/performance-reviews').then((res) => res.data.data),
  });
};

export const useCreatePerformanceReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PerformanceReview>) => api.post('/performance-reviews', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['performance-reviews'] }),
  });
};

export const useUpdatePerformanceReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PerformanceReview> }) => 
      api.put(`/performance-reviews/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['performance-reviews'] }),
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/performance-reviews` | Yes | `usePerformanceReviews()` |
| POST | `/performance-reviews` | Yes | `useCreatePerformanceReview()` |
| GET | `/performance-reviews/:id` | Yes | `usePerformanceReview(id)` |
| PUT | `/performance-reviews/:id` | Yes | `useUpdatePerformanceReview()` |

### UI Components Needed
- `PerformanceDashboard` - Overview with stats
- `ReviewForm` - Multi-step evaluation form
- `PerformanceHistory` - Timeline of past reviews

---

## 9. Projects

### UI Section: Project Management Hub
**Design:** Kanban-style board view. Gantt chart timeline. Project cards with progress bars. Team member avatars with hover details.

```typescript
// hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  start_date?: string;
  end_date?: string;
  budget?: number;
}

export const useProjects = (status?: string) => {
  return useQuery({
    queryKey: ['projects', status],
    queryFn: () => api.get(`/projects?status=${status || ''}`).then((res) => res.data.data),
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useProjectTemplates = () => {
  return useQuery({
    queryKey: ['project-templates'],
    queryFn: () => api.get('/projects/templates').then((res) => res.data.data),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Project>) => api.post('/projects', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => 
      api.put(`/projects/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useProjectMembers = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId, 'members'],
    queryFn: () => api.get(`/projects/${projectId}/members`).then((res) => res.data.data),
    enabled: !!projectId,
  });
};

export const useAddProjectMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) => 
      api.post(`/projects/${projectId}/members`, { user_id: userId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId, 'members'] });
    },
  });
};

export const useProjectTimeline = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId, 'timeline'],
    queryFn: () => api.get(`/projects/${projectId}/timeline`).then((res) => res.data.data),
    enabled: !!projectId,
  });
};

export const useProjectBudget = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId, 'budget'],
    queryFn: () => api.get(`/projects/${projectId}/budget`).then((res) => res.data.data),
    enabled: !!projectId,
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/projects` | Yes | `useProjects()` |
| POST | `/projects` | Yes | `useCreateProject()` |
| GET | `/projects/templates` | Yes | `useProjectTemplates()` |
| GET | `/projects/:id` | Yes | `useProject(id)` |
| PUT | `/projects/:id` | Yes | `useUpdateProject()` |
| DELETE | `/projects/:id` | Yes | `useDeleteProject()` |
| GET | `/projects/:id/members` | Yes | `useProjectMembers()` |
| POST | `/projects/:id/members` | Yes | `useAddProjectMember()` |
| DELETE | `/projects/:id/members/:userId` | Yes | `useRemoveProjectMember()` |
| GET | `/projects/:id/timeline` | Yes | `useProjectTimeline()` |
| GET | `/projects/:id/budget` | Yes | `useProjectBudget()` |

### UI Components Needed
- `ProjectsPage` - Grid/list view with filters
- `ProjectDetailPage` - Overview, members, timeline tabs
- `ProjectBoard` - Kanban board for tasks
- `ProjectGanttChart` - Timeline visualization

---

## 10. Tasks

### UI Section: Task Management
**Design:** Task cards with priority indicators. Drag-and-drop board. Time tracking widget. Subtask checklist.

```typescript
// hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string;
  due_date?: string;
}

export const useProjectTasks = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId, 'tasks'],
    queryFn: () => api.get(`/projects/${projectId}/tasks`).then((res) => res.data.data),
    enabled: !!projectId,
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => api.get(`/tasks/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<Task> }) => 
      api.post(`/projects/${projectId}/tasks`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId, 'tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => 
      api.put(`/tasks/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      api.post(`/tasks/${id}/assign`, { user_id: userId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.post(`/tasks/${id}/status`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useTaskTimeLogs = (taskId: string) => {
  return useQuery({
    queryKey: ['task', taskId, 'time-logs'],
    queryFn: () => api.get(`/tasks/${taskId}/time-logs`).then((res) => res.data.data),
    enabled: !!taskId,
  });
};

export const useLogTime = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, hours, description }: { taskId: string; hours: number; description?: string }) => 
      api.post(`/tasks/${taskId}/time-logs`, { hours, description }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId, 'time-logs'] });
    },
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/projects/:id/tasks` | Yes | `useProjectTasks()` |
| POST | `/projects/:id/tasks` | Yes | `useCreateTask()` |
| GET | `/tasks/:id` | Yes | `useTask(id)` |
| PUT | `/tasks/:id` | Yes | `useUpdateTask()` |
| DELETE | `/tasks/:id` | Yes | `useDeleteTask()` |
| POST | `/tasks/:id/assign` | Yes | `useAssignTask()` |
| POST | `/tasks/:id/status` | Yes | `useUpdateTaskStatus()` |
| GET | `/tasks/:id/time-logs` | Yes | `useTaskTimeLogs()` |
| POST | `/tasks/:id/time-logs` | Yes | `useLogTime()` |

### UI Components Needed
- `TaskBoard` - Kanban board with drag-drop
- `TaskCard` - Compact card with priority colors
- `TaskDetailModal` - Full task view with comments
- `TimeTracker` - Timer widget for logging

---

## 11. Sprints

### UI Section: Sprint Planning
**Design:** Sprint board with velocity charts. Burndown chart. Story point estimation cards.

```typescript
// hooks/useSprints.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed';
}

export const useProjectSprints = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId, 'sprints'],
    queryFn: () => api.get(`/projects/${projectId}/sprints`).then((res) => res.data.data),
    enabled: !!projectId,
  });
};

export const useCreateSprint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<Sprint> }) => 
      api.post(`/projects/${projectId}/sprints`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId, 'sprints'] });
    },
  });
};

export const useSprint = (id: string) => {
  return useQuery({
    queryKey: ['sprint', id],
    queryFn: () => api.get(`/sprints/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useUpdateSprint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sprint> }) => 
      api.put(`/sprints/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sprint', variables.id] });
    },
  });
};

export const useStartSprint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/sprints/${id}/start`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sprints'] }),
  });
};

export const useCompleteSprint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/sprints/${id}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sprints'] }),
  });
};

export const useSprintBurndown = (sprintId: string) => {
  return useQuery({
    queryKey: ['sprint', sprintId, 'burndown'],
    queryFn: () => api.get(`/sprints/${sprintId}/burndown`).then((res) => res.data.data),
    enabled: !!sprintId,
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/projects/:id/sprints` | Yes | `useProjectSprints()` |
| POST | `/projects/:id/sprints` | Yes | `useCreateSprint()` |
| GET | `/sprints/:id` | Yes | `useSprint(id)` |
| PUT | `/sprints/:id` | Yes | `useUpdateSprint()` |
| DELETE | `/sprints/:id` | Yes | `useDeleteSprint()` |
| POST | `/sprints/:id/start` | Yes | `useStartSprint()` |
| POST | `/sprints/:id/complete` | Yes | `useCompleteSprint()` |
| GET | `/sprints/:id/burndown` | Yes | `useSprintBurndown()` |

### UI Components Needed
- `SprintBoard` - Agile board with swimlanes
- `SprintPlanning` - Backlog grooming interface
- `BurndownChart` - Velocity tracking chart
- `SprintRetrospective` - Retro board

---

## 12. Milestones

### UI Section: Milestone Timeline
**Design:** Horizontal timeline with milestone markers. Progress rings. Dependency lines.

```typescript
// hooks/useMilestones.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  due_date: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
}

export const useProjectMilestones = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId, 'milestones'],
    queryFn: () => api.get(`/projects/${projectId}/milestones`).then((res) => res.data.data),
    enabled: !!projectId,
  });
};

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<Milestone> }) => 
      api.post(`/projects/${projectId}/milestones`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId, 'milestones'] });
    },
  });
};

export const useMilestone = (id: string) => {
  return useQuery({
    queryKey: ['milestone', id],
    queryFn: () => api.get(`/milestones/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Milestone> }) => 
      api.put(`/milestones/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestone', variables.id] });
    },
  });
};

export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/milestones/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestones'] }),
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/projects/:id/milestones` | Yes | `useProjectMilestones()` |
| POST | `/projects/:id/milestones` | Yes | `useCreateMilestone()` |
| GET | `/milestones/:id` | Yes | `useMilestone(id)` |
| PUT | `/milestones/:id` | Yes | `useUpdateMilestone()` |
| DELETE | `/milestones/:id` | Yes | `useDeleteMilestone()` |

### UI Components Needed
- `MilestoneTimeline` - Horizontal timeline
- `MilestoneCard` - Progress indicator card
- `MilestoneForm` - Create/edit modal

---

## 13. Pipelines (Kanban)

### UI Section: Kanban Boards
**Design:** Drag-and-drop columns with WIP limits. Color-coded cards. Swimlane view.

```typescript
// hooks/usePipelines.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Pipeline {
  id: string;
  name: string;
  description?: string;
}

interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  order: number;
  wip_limit?: number;
}

export const usePipelines = () => {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: () => api.get('/pipelines').then((res) => res.data.data),
  });
};

export const usePipeline = (id: string) => {
  return useQuery({
    queryKey: ['pipeline', id],
    queryFn: () => api.get(`/pipelines/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useCreatePipeline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Pipeline>) => api.post('/pipelines', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pipelines'] }),
  });
};

export const useUpdatePipeline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pipeline> }) => 
      api.put(`/pipelines/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pipelines'] }),
  });
};

export const useDeletePipeline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/pipelines/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pipelines'] }),
  });
};

export const usePipelineStages = (pipelineId: string) => {
  return useQuery({
    queryKey: ['pipeline', pipelineId, 'stages'],
    queryFn: () => api.get(`/pipelines/${pipelineId}/stages`).then((res) => res.data.data),
    enabled: !!pipelineId,
  });
};

export const useCreateStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, data }: { pipelineId: string; data: Partial<PipelineStage> }) => 
      api.post(`/pipelines/${pipelineId}/stages`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline', variables.pipelineId, 'stages'] });
    },
  });
};

export const useUpdateStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PipelineStage> }) => 
      api.put(`/pipelines/stages/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stages'] }),
  });
};

export const useDeleteStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/pipelines/stages/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stages'] }),
  });
};

export const useMoveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, taskId, stageId }: { pipelineId: string; taskId: string; stageId: string }) => 
      api.post(`/pipelines/${pipelineId}/move-task`, { task_id: taskId, stage_id: stageId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline', variables.pipelineId] });
    },
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/pipelines` | Yes | `usePipelines()` |
| POST | `/pipelines` | Yes | `useCreatePipeline()` |
| GET | `/pipelines/:id` | Yes | `usePipeline(id)` |
| PUT | `/pipelines/:id` | Yes | `useUpdatePipeline()` |
| DELETE | `/pipelines/:id` | Yes | `useDeletePipeline()` |
| GET | `/pipelines/:id/stages` | Yes | `usePipelineStages()` |
| POST | `/pipelines/:id/stages` | Yes | `useCreateStage()` |
| POST | `/pipelines/:id/move-task` | Yes | `useMoveTask()` |
| PUT | `/pipelines/stages/:id` | Yes | `useUpdateStage()` |
| DELETE | `/pipelines/stages/:id` | Yes | `useDeleteStage()` |

### UI Components Needed
- `KanbanBoard` - Drag-drop board with columns
- `PipelineSettings` - Configure stages, WIP limits
- `PipelineSelector` - Switch between boards

---

## 14. Automations

### UI Section: Workflow Builder
**Design:** Visual flowchart builder. Trigger-action cards. Condition builder with dropdowns.

```typescript
// hooks/useAutomations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Automation {
  id: string;
  pipeline_id: string;
  name: string;
  trigger: string;
  actions: unknown[];
  active: boolean;
}

export const usePipelineAutomations = (pipelineId: string) => {
  return useQuery({
    queryKey: ['pipeline', pipelineId, 'automations'],
    queryFn: () => api.get(`/pipelines/${pipelineId}/automations`).then((res) => res.data.data),
    enabled: !!pipelineId,
  });
};

export const useCreateAutomation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, data }: { pipelineId: string; data: Partial<Automation> }) => 
      api.post(`/pipelines/${pipelineId}/automations`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline', variables.pipelineId, 'automations'] });
    },
  });
};

export const useAutomation = (id: string) => {
  return useQuery({
    queryKey: ['automation', id],
    queryFn: () => api.get(`/automations/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useUpdateAutomation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Automation> }) => 
      api.put(`/automations/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['automation', variables.id] });
    },
  });
};

export const useDeleteAutomation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/automations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automations'] }),
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/pipelines/:id/automations` | Yes | `usePipelineAutomations()` |
| POST | `/pipelines/:id/automations` | Yes | `useCreateAutomation()` |
| GET | `/automations/:id` | Yes | `useAutomation(id)` |
| PUT | `/automations/:id` | Yes | `useUpdateAutomation()` |
| DELETE | `/automations/:id` | Yes | `useDeleteAutomation()` |

### UI Components Needed
- `AutomationBuilder` - Visual workflow builder
- `AutomationList` - List of active automations
- `TriggerSelector` - Choose triggers from dropdown

---

## 15. Chat

### UI Section: Messaging Platform
**Design:** Slack-inspired sidebar with channels. Message bubbles with avatars. Thread view. Typing indicators.

```typescript
// hooks/useChat.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ChatRoom {
  id: string;
  name: string;
  type: 'channel' | 'direct';
  participants: unknown[];
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  thread_id?: string;
}

export const useChatRooms = () => {
  return useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => api.get('/chat/rooms').then((res) => res.data.data),
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ChatRoom>) => api.post('/chat/rooms', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-rooms'] }),
  });
};

export const useRoom = (id: string) => {
  return useQuery({
    queryKey: ['chat-room', id],
    queryFn: () => api.get(`/chat/rooms/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useJoinRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/chat/rooms/${id}/join`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-rooms'] }),
  });
};

export const useLeaveRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/chat/rooms/${id}/leave`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-rooms'] }),
  });
};

export const useRoomMessages = (roomId: string) => {
  return useQuery({
    queryKey: ['chat-room', roomId, 'messages'],
    queryFn: () => api.get(`/chat/rooms/${roomId}/messages`).then((res) => res.data.data),
    enabled: !!roomId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, content }: { roomId: string; content: string }) => 
      api.post(`/chat/rooms/${roomId}/messages`, { content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-room', variables.roomId, 'messages'] });
    },
  });
};

export const useMessageThread = (roomId: string, messageId: string) => {
  return useQuery({
    queryKey: ['chat-room', roomId, 'messages', messageId, 'thread'],
    queryFn: () => api.get(`/chat/rooms/${roomId}/messages/${messageId}/thread`).then((res) => res.data.data),
    enabled: !!roomId && !!messageId,
  });
};

export const useMarkRoomRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => api.post(`/chat/rooms/${roomId}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-rooms'] }),
  });
};

export const useEditMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => 
      api.put(`/chat/messages/${id}`, { content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/chat/messages/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) => 
      api.post(`/chat/messages/${messageId}/reactions`, { emoji }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });
};

export const useSearchMessages = (query: string) => {
  return useQuery({
    queryKey: ['chat-search', query],
    queryFn: () => api.get(`/chat/search?q=${query}`).then((res) => res.data.data),
    enabled: query.length > 2,
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/chat/rooms` | Yes | `useChatRooms()` |
| POST | `/chat/rooms` | Yes | `useCreateRoom()` |
| GET | `/chat/rooms/:id` | Yes | `useRoom(id)` |
| PUT | `/chat/rooms/:id` | Yes | `useUpdateRoom()` |
| DELETE | `/chat/rooms/:id` | Yes | `useDeleteRoom()` |
| POST | `/chat/rooms/:id/join` | Yes | `useJoinRoom()` |
| POST | `/chat/rooms/:id/leave` | Yes | `useLeaveRoom()` |
| GET | `/chat/rooms/:id/messages` | Yes | `useRoomMessages()` |
| POST | `/chat/rooms/:id/messages` | Yes | `useSendMessage()` |
| GET | `/chat/rooms/:id/messages/:messageId/thread` | Yes | `useMessageThread()` |
| POST | `/chat/rooms/:id/read` | Yes | `useMarkRoomRead()` |
| PUT | `/chat/messages/:id` | Yes | `useEditMessage()` |
| DELETE | `/chat/messages/:id` | Yes | `useDeleteMessage()` |
| POST | `/chat/messages/:id/reactions` | Yes | `useAddReaction()` |
| GET | `/chat/search` | Yes | `useSearchMessages()` |

### UI Components Needed
- `ChatLayout` - Sidebar + main chat area
- `MessageList` - Virtualized message scroll
- `MessageBubble` - Avatar + content + reactions
- `ThreadPanel` - Side panel for threads
- `RoomList` - Channel/DM list with unread badges

---

## 16. Announcements

### UI Section: Company News Feed
**Design:** Card-based feed with pinned items at top. Rich text content. Acknowledgment buttons.

```typescript
// hooks/useAnnouncements.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
}

export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements').then((res) => res.data.data),
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Announcement>) => api.post('/announcements', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
};

export const useAnnouncement = (id: string) => {
  return useQuery({
    queryKey: ['announcement', id],
    queryFn: () => api.get(`/announcements/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Announcement> }) => 
      api.put(`/announcements/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
};

export const usePinAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/announcements/${id}/pin`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
};

export const useAcknowledgeAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/announcements/${id}/acknowledge`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
};

export const useAnnouncementAcknowledgements = (id: string) => {
  return useQuery({
    queryKey: ['announcement', id, 'acknowledgements'],
    queryFn: () => api.get(`/announcements/${id}/acknowledgements`).then((res) => res.data.data),
    enabled: !!id,
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/announcements` | Yes | `useAnnouncements()` |
| POST | `/announcements` | Yes | `useCreateAnnouncement()` |
| GET | `/announcements/:id` | Yes | `useAnnouncement(id)` |
| PUT | `/announcements/:id` | Yes | `useUpdateAnnouncement()` |
| DELETE | `/announcements/:id` | Yes | `useDeleteAnnouncement()` |
| POST | `/announcements/:id/pin` | Yes | `usePinAnnouncement()` |
| POST | `/announcements/:id/acknowledge` | Yes | `useAcknowledgeAnnouncement()` |
| GET | `/announcements/:id/acknowledgements` | Yes | `useAnnouncementAcknowledgements()` |

### UI Components Needed
- `AnnouncementsFeed` - Card list with pinned section
- `AnnouncementCard` - Rich text display with actions
- `AnnouncementEditor` - WYSIWYG editor
- `AcknowledgementTracker` - Who has seen it

---

## 17. Notifications

### UI Section: Notification Center
**Design:** Bell icon with badge. Slide-out panel with grouped notifications. Action buttons inline.

```typescript
// hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((res) => res.data.data),
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get('/notifications/unread-count').then((res) => res.data.data.count),
  });
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => api.get('/notifications/preferences').then((res) => res.data.data),
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.put('/notifications/preferences', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-preferences'] }),
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/notifications` | Yes | `useNotifications()` |
| GET | `/notifications/unread-count` | Yes | `useUnreadCount()` |
| PUT | `/notifications/:id/read` | Yes | `useMarkRead()` |
| PUT | `/notifications/read-all` | Yes | `useMarkAllRead()` |
| DELETE | `/notifications/:id` | Yes | `useDeleteNotification()` |
| GET | `/notifications/preferences` | Yes | `useNotificationPreferences()` |
| PUT | `/notifications/preferences` | Yes | `useUpdatePreferences()` |

### UI Components Needed
- `NotificationBell` - Icon with unread badge
- `NotificationPanel` - Slide-out list
- `NotificationItem` - Individual notification card
- `NotificationSettings` - Preference toggles

---

## 18. Culture (Events, Trips, Polls, Recognitions)

### UI Section: Company Culture Hub
**Design:** Vibrant, engaging layout. Event cards with images. Poll bars with animations. Recognition wall with confetti effects.

```typescript
// hooks/useCulture.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Events
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => api.get('/culture/events').then((res) => res.data.data),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/culture/events', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get(`/culture/events/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/culture/events/${id}/register`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
};

export const useEventGallery = (id: string) => {
  return useQuery({
    queryKey: ['event', id, 'gallery'],
    queryFn: () => api.get(`/culture/events/${id}/gallery`).then((res) => res.data.data),
    enabled: !!id,
  });
};

// Trips
export const useTrips = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: () => api.get('/culture/trips').then((res) => res.data.data),
  });
};

export const useTrip = (id: string) => {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: () => api.get(`/culture/trips/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useRegisterForTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/culture/trips/${id}/register`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
};

export const useTripItinerary = (id: string) => {
  return useQuery({
    queryKey: ['trip', id, 'itinerary'],
    queryFn: () => api.get(`/culture/trips/${id}/itinerary`).then((res) => res.data.data),
    enabled: !!id,
  });
};

// Polls
export const usePolls = () => {
  return useQuery({
    queryKey: ['polls'],
    queryFn: () => api.get('/culture/polls').then((res) => res.data.data),
  });
};

export const usePoll = (id: string) => {
  return useQuery({
    queryKey: ['poll', id],
    queryFn: () => api.get(`/culture/polls/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const usePollResults = (id: string) => {
  return useQuery({
    queryKey: ['poll', id, 'results'],
    queryFn: () => api.get(`/culture/polls/${id}/results`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useVotePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, optionId }: { id: string; optionId: string }) => 
      api.post(`/culture/polls/${id}/vote`, { option_id: optionId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['poll', variables.id] });
    },
  });
};

// Recognitions
export const useRecognitions = () => {
  return useQuery({
    queryKey: ['recognitions'],
    queryFn: () => api.get('/culture/recognitions').then((res) => res.data.data),
  });
};

export const useCreateRecognition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/culture/recognitions', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recognitions'] }),
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/culture/leaderboard').then((res) => res.data.data),
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| **Events** |
| GET | `/culture/events` | Yes | `useEvents()` |
| POST | `/culture/events` | Yes | `useCreateEvent()` |
| GET | `/culture/events/:id` | Yes | `useEvent(id)` |
| PUT | `/culture/events/:id` | Yes | `useUpdateEvent()` |
| DELETE | `/culture/events/:id` | Yes | `useDeleteEvent()` |
| POST | `/culture/events/:id/register` | Yes | `useRegisterForEvent()` |
| GET | `/culture/events/:id/gallery` | Yes | `useEventGallery()` |
| **Trips** |
| GET | `/culture/trips` | Yes | `useTrips()` |
| POST | `/culture/trips` | Yes | `useCreateTrip()` |
| GET | `/culture/trips/:id` | Yes | `useTrip(id)` |
| POST | `/culture/trips/:id/register` | Yes | `useRegisterForTrip()` |
| GET | `/culture/trips/:id/itinerary` | Yes | `useTripItinerary()` |
| **Polls** |
| GET | `/culture/polls` | Yes | `usePolls()` |
| POST | `/culture/polls` | Yes | `useCreatePoll()` |
| GET | `/culture/polls/:id` | Yes | `usePoll(id)` |
| GET | `/culture/polls/:id/results` | Yes | `usePollResults()` |
| POST | `/culture/polls/:id/vote` | Yes | `useVotePoll()` |
| **Recognitions** |
| GET | `/culture/recognitions` | Yes | `useRecognitions()` |
| POST | `/culture/recognitions` | Yes | `useCreateRecognition()` |
| GET | `/culture/leaderboard` | Yes | `useLeaderboard()` |

### UI Components Needed
- `CultureHub` - Tabbed interface (Events, Trips, Polls, Recognition)
- `EventCard` - Image card with date, location, register button
- `PollCard` - Voting interface with animated bars
- `RecognitionWall` - Masonry grid of recognition cards
- `Leaderboard` - Top contributors list

---

## 19. Clients & CRM

### UI Section: CRM Dashboard
**Design:** Pipeline view for deals. Contact cards with company logos. Contract timeline. Support ticket kanban.

```typescript
// hooks/useClients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
}

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients').then((res) => res.data.data),
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => api.get(`/clients/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Client>) => api.post('/clients', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => 
      api.put(`/clients/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
};

export const useClientContacts = (clientId: string) => {
  return useQuery({
    queryKey: ['client', clientId, 'contacts'],
    queryFn: () => api.get(`/clients/${clientId}/contacts`).then((res) => res.data.data),
    enabled: !!clientId,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: unknown }) => 
      api.post(`/clients/${clientId}/contacts`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId, 'contacts'] });
    },
  });
};

export const useClientProjects = (clientId: string) => {
  return useQuery({
    queryKey: ['client', clientId, 'projects'],
    queryFn: () => api.get(`/clients/${clientId}/projects`).then((res) => res.data.data),
    enabled: !!clientId,
  });
};

export const useClientContracts = (clientId: string) => {
  return useQuery({
    queryKey: ['client', clientId, 'contracts'],
    queryFn: () => api.get(`/clients/${clientId}/contracts`).then((res) => res.data.data),
    enabled: !!clientId,
  });
};

export const useClientInvoices = (clientId: string) => {
  return useQuery({
    queryKey: ['client', clientId, 'invoices'],
    queryFn: () => api.get(`/clients/${clientId}/invoices`).then((res) => res.data.data),
    enabled: !!clientId,
  });
};

// Contracts
export const useContracts = () => {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: () => api.get('/contracts').then((res) => res.data.data),
  });
};

export const useContract = (id: string) => {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: () => api.get(`/contracts/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useRenewContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/contracts/${id}/renew`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });
};

export const useTerminateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/contracts/${id}/terminate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });
};

// Support Tickets
export const useTickets = () => {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: () => api.get('/tickets').then((res) => res.data.data),
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.get(`/tickets/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useAssignTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      api.post(`/tickets/${id}/assign`, { user_id: userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
};

export const useResolveTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/tickets/${id}/resolve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
};

export const useTicketComments = (ticketId: string) => {
  return useQuery({
    queryKey: ['ticket', ticketId, 'comments'],
    queryFn: () => api.get(`/tickets/${ticketId}/comments`).then((res) => res.data.data),
    enabled: !!ticketId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, content }: { ticketId: string; content: string }) => 
      api.post(`/tickets/${ticketId}/comments`, { content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId, 'comments'] });
    },
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| **Clients** |
| GET | `/clients` | Yes | `useClients()` |
| POST | `/clients` | Yes | `useCreateClient()` |
| GET | `/clients/:id` | Yes | `useClient(id)` |
| PUT | `/clients/:id` | Yes | `useUpdateClient()` |
| DELETE | `/clients/:id` | Yes | `useDeleteClient()` |
| GET | `/clients/:id/contacts` | Yes | `useClientContacts()` |
| POST | `/clients/:id/contacts` | Yes | `useCreateContact()` |
| GET | `/clients/:id/projects` | Yes | `useClientProjects()` |
| GET | `/clients/:id/contracts` | Yes | `useClientContracts()` |
| GET | `/clients/:id/invoices` | Yes | `useClientInvoices()` |
| **Contacts** |
| GET | `/contacts/:id` | Yes | `useContact(id)` |
| PUT | `/contacts/:id` | Yes | `useUpdateContact()` |
| DELETE | `/contacts/:id` | Yes | `useDeleteContact()` |
| **Contracts** |
| GET | `/contracts` | Yes | `useContracts()` |
| POST | `/contracts` | Yes | `useCreateContract()` |
| GET | `/contracts/:id` | Yes | `useContract(id)` |
| PUT | `/contracts/:id` | Yes | `useUpdateContract()` |
| DELETE | `/contracts/:id` | Yes | `useDeleteContract()` |
| POST | `/contracts/:id/renew` | Yes | `useRenewContract()` |
| POST | `/contracts/:id/terminate` | Yes | `useTerminateContract()` |
| **Tickets** |
| GET | `/tickets` | Yes | `useTickets()` |
| POST | `/tickets` | Yes | `useCreateTicket()` |
| GET | `/tickets/:id` | Yes | `useTicket(id)` |
| PUT | `/tickets/:id` | Yes | `useUpdateTicket()` |
| POST | `/tickets/:id/assign` | Yes | `useAssignTicket()` |
| POST | `/tickets/:id/resolve` | Yes | `useResolveTicket()` |
| GET | `/tickets/:id/comments` | Yes | `useTicketComments()` |
| POST | `/tickets/:id/comments` | Yes | `useAddComment()` |

### UI Components Needed
- `CRMDashboard` - Pipeline, stats, recent activity
- `ClientList` - Table with quick actions
- `ClientDetailPage` - Tabs for contacts, projects, contracts
- `ContractTimeline` - Visual contract lifecycle
- `TicketBoard` - Kanban for support tickets

---

## 20. Finance

### UI Section: Financial Dashboard
**Design:** Charts and graphs for financial data. Payroll tables with download buttons. Expense approval cards.

```typescript
// hooks/useFinance.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Payroll
export const usePayrollCycles = () => {
  return useQuery({
    queryKey: ['payroll'],
    queryFn: () => api.get('/payroll').then((res) => res.data.data),
  });
};

export const useGeneratePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/payroll/generate', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] }),
  });
};

export const usePayroll = (id: string) => {
  return useQuery({
    queryKey: ['payroll', id],
    queryFn: () => api.get(`/payroll/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useProcessPayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/payroll/${id}/process`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] }),
  });
};

export const usePublishPayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/payroll/${id}/publish`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] }),
  });
};

export const usePayslips = (payrollId: string) => {
  return useQuery({
    queryKey: ['payroll', payrollId, 'payslips'],
    queryFn: () => api.get(`/payroll/${payrollId}/payslips`).then((res) => res.data.data),
    enabled: !!payrollId,
  });
};

export const useMyPayroll = () => {
  return useQuery({
    queryKey: ['payroll', 'my'],
    queryFn: () => api.get('/payroll/my').then((res) => res.data.data),
  });
};

export const useDownloadPayslip = () => {
  return useMutation({
    mutationFn: (id: string) => api.get(`/payroll/my/payslips/${id}/download`, { responseType: 'blob' }),
  });
};

// Salary Structures
export const useSalaryStructures = () => {
  return useQuery({
    queryKey: ['salary-structures'],
    queryFn: () => api.get('/salary-structures').then((res) => res.data.data),
  });
};

export const useCreateSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/salary-structures', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salary-structures'] }),
  });
};

// Expenses
export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => api.get('/expenses').then((res) => res.data.data),
  });
};

export const useMyExpenses = () => {
  return useQuery({
    queryKey: ['expenses', 'my'],
    queryFn: () => api.get('/expenses/my').then((res) => res.data.data),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/expenses', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
};

export const useApproveExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/expenses/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
};

export const useRejectExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/expenses/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
};

// Budgets
export const useBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => api.get('/budgets').then((res) => res.data.data),
  });
};

export const useBudget = (id: string) => {
  return useQuery({
    queryKey: ['budget', id],
    queryFn: () => api.get(`/budgets/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useBudgetTransactions = (budgetId: string) => {
  return useQuery({
    queryKey: ['budget', budgetId, 'transactions'],
    queryFn: () => api.get(`/budgets/${budgetId}/transactions`).then((res) => res.data.data),
    enabled: !!budgetId,
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| **Payroll** |
| GET | `/payroll` | Yes | `usePayrollCycles()` |
| POST | `/payroll/generate` | Yes | `useGeneratePayroll()` |
| GET | `/payroll/:id` | Yes | `usePayroll(id)` |
| PUT | `/payroll/:id` | Yes | `useUpdatePayroll()` |
| POST | `/payroll/:id/process` | Yes | `useProcessPayroll()` |
| POST | `/payroll/:id/publish` | Yes | `usePublishPayroll()` |
| GET | `/payroll/:id/payslips` | Yes | `usePayslips()` |
| GET | `/payroll/my` | Yes | `useMyPayroll()` |
| GET | `/payroll/my/payslips/:id/download` | Yes | `useDownloadPayslip()` |
| **Salary Structures** |
| GET | `/salary-structures` | Yes | `useSalaryStructures()` |
| POST | `/salary-structures` | Yes | `useCreateSalaryStructure()` |
| GET | `/salary-structures/:id` | Yes | `useSalaryStructure(id)` |
| PUT | `/salary-structures/:id` | Yes | `useUpdateSalaryStructure()` |
| **Expenses** |
| GET | `/expenses` | Yes | `useExpenses()` |
| POST | `/expenses` | Yes | `useCreateExpense()` |
| GET | `/expenses/:id` | Yes | `useExpense(id)` |
| PUT | `/expenses/:id` | Yes | `useUpdateExpense()` |
| POST | `/expenses/:id/approve` | Yes | `useApproveExpense()` |
| POST | `/expenses/:id/reject` | Yes | `useRejectExpense()` |
| GET | `/expenses/my` | Yes | `useMyExpenses()` |
| **Budgets** |
| GET | `/budgets` | Yes | `useBudgets()` |
| POST | `/budgets` | Yes | `useCreateBudget()` |
| GET | `/budgets/:id` | Yes | `useBudget(id)` |
| PUT | `/budgets/:id` | Yes | `useUpdateBudget()` |
| GET | `/budgets/:id/transactions` | Yes | `useBudgetTransactions()` |
| POST | `/budgets/:id/transactions` | Yes | `useCreateTransaction()` |

### UI Components Needed
- `FinanceDashboard` - Charts, stats, quick actions
- `PayrollCalendar` - Monthly payroll view
- `PayslipViewer` - PDF viewer with download
- `ExpenseForm` - Receipt upload, approval flow
- `BudgetTracker` - Progress bars, transactions

---

## 21. Audit & Compliance

### UI Section: Audit Center
**Design:** Data table with advanced filters. Export buttons. Compliance status cards.

```typescript
// hooks/useAudit.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useAuditLogs = (filters?: unknown) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => api.get('/audit-logs', { params: filters }).then((res) => res.data.data),
  });
};

export const useAuditStats = () => {
  return useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => api.get('/audit-logs/stats').then((res) => res.data.data),
  });
};

export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: (filters?: unknown) => 
      api.get('/audit-logs/export', { params: filters, responseType: 'blob' }),
  });
};

export const useComplianceReports = () => {
  return useQuery({
    queryKey: ['compliance-reports'],
    queryFn: () => api.get('/compliance/reports').then((res) => res.data.data),
  });
};

export const useGDPRExport = () => {
  return useMutation({
    mutationFn: () => api.get('/compliance/gdpr/export', { responseType: 'blob' }),
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| GET | `/audit-logs` | Yes | `useAuditLogs()` |
| GET | `/audit-logs/:id` | Yes | `useAuditLog(id)` |
| GET | `/audit-logs/search` | Yes | `useSearchAuditLogs()` |
| GET | `/audit-logs/export` | Yes | `useExportAuditLogs()` |
| GET | `/audit-logs/stats` | Yes | `useAuditStats()` |
| GET | `/compliance/gdpr/export` | Yes | `useGDPRExport()` |
| POST | `/compliance/gdpr/delete-request` | Yes | `useGDPRDeleteRequest()` |
| GET | `/compliance/retention-policies` | Yes | `useRetentionPolicies()` |
| PUT | `/compliance/retention-policies/:id` | Yes | `useUpdateRetentionPolicy()` |
| GET | `/compliance/reports` | Yes | `useComplianceReports()` |

### UI Components Needed
- `AuditLogViewer` - Filterable data table
- `ComplianceDashboard` - Status overview
- `GDPRTools` - Export/delete requests

---

## 22. File Upload

### UI Section: File Manager
**Design:** Drag-and-drop upload zone. Grid/list view of files. Preview modal.

```typescript
// hooks/useUpload.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useUploadFile = () => {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  });
};
```

### API Endpoints

| Method | Endpoint | Auth | TanStack Query Hook |
|--------|----------|------|-------------------|
| POST | `/upload` | Yes | `useUploadFile()` |
| GET | `/files/:folder/:filename` | No | Direct URL |

### UI Components Needed
- `FileUploader` - Drag-drop zone with progress
- `FileGrid` - Grid of uploaded files
- `FilePreview` - Modal preview

---

## 23. WebSocket

### UI Section: Real-time Features
**Design:** Live indicators. Typing dots. Instant updates.

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (token: string) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<unknown[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
    ws.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => socket.close();
  }, [token]);

  const send = (data: unknown) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  };

  return { connected, messages, send };
};
```

### Usage
- Real-time chat messages
- Live notifications
- Collaborative editing
- Presence indicators

---

## UI Design System

### Color Palette
```css
:root {
  --primary: #6366f1;      /* Indigo 500 */
  --primary-dark: #4f46e5;  /* Indigo 600 */
  --secondary: #ec4899;     /* Pink 500 */
  --success: #22c55e;       /* Green 500 */
  --warning: #f59e0b;       /* Amber 500 */
  --danger: #ef4444;        /* Red 500 */
  --info: #3b82f6;          /* Blue 500 */
  
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;   /* Slate 50 */
  --bg-tertiary: #f1f5f9;    /* Slate 100 */
  
  --text-primary: #0f172a;   /* Slate 900 */
  --text-secondary: #475569; /* Slate 600 */
  --text-muted: #94a3b8;     /* Slate 400 */
  
  --border: #e2e8f0;         /* Slate 200 */
  --border-focus: #6366f1;   /* Indigo 500 */
}
```

### Typography
- **Headings:** Inter, 600-700 weight
- **Body:** Inter, 400 weight
- **Monospace:** JetBrains Mono (for code/data)
- **Scale:** 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px

### Spacing Scale
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

### Component Patterns
- **Cards:** Rounded-xl (12px), shadow-sm, hover:shadow-md transition
- **Buttons:** Rounded-lg, font-medium, transition-all duration-200
- **Inputs:** Rounded-lg, border-2 focus:border-primary
- **Tables:** Striped rows, hover highlight, sticky header
- **Modals:** Backdrop blur, slide-in animation
- **Toasts:** Bottom-right, auto-dismiss, progress bar

### Animation Specs
- **Transitions:** 200ms ease-in-out
- **Page transitions:** Fade + slide (300ms)
- **Loading:** Skeleton screens, pulse animation
- **Micro-interactions:** Scale on hover, color transitions

### Responsive Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px
- **Wide:** > 1280px

### Icons
- **Library:** Lucide React
- **Size:** 16px (sm), 20px (md), 24px (lg)
- **Stroke width:** 2px

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   └── features/        # Feature-specific components
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUsers.ts
│   │   ├── useRoles.ts
│   │   ├── useStaff.ts
│   │   ├── useDepartments.ts
│   │   ├── useAttendance.ts
│   │   ├── useLeaves.ts
│   │   ├── usePerformance.ts
│   │   ├── useProjects.ts
│   │   ├── useTasks.ts
│   │   ├── useSprints.ts
│   │   ├── useMilestones.ts
│   │   ├── usePipelines.ts
│   │   ├── useAutomations.ts
│   │   ├── useChat.ts
│   │   ├── useAnnouncements.ts
│   │   ├── useNotifications.ts
│   │   ├── useCulture.ts
│   │   ├── useClients.ts
│   │   ├── useFinance.ts
│   │   ├── useAudit.ts
│   │   ├── useUpload.ts
│   │   └── useWebSocket.ts
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── staff/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── chat/
│   │   ├── culture/
│   │   ├── clients/
│   │   ├── finance/
│   │   └── settings/
│   ├── lib/
│   │   ├── api.ts          # Axios instance
│   │   └── utils.ts
│   ├── store/
│   │   ├── auth.ts         # Zustand auth store
│   │   └── ui.ts           # UI state store
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── providers/
│       └── QueryProvider.tsx
├── public/
├── package.json
└── tailwind.config.ts
```

---

## Quick Start

1. **Install dependencies:**
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools axios zustand lucide-react framer-motion recharts
```

2. **Setup environment:**
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080/ws
```

3. **Wrap app with providers:**
```tsx
import { QueryProvider } from './providers/QueryProvider';

function App() {
  return (
    <QueryProvider>
      <Router />
    </QueryProvider>
  );
}
```

4. **Use hooks in components:**
```tsx
import { useProjects } from '@/hooks/useProjects';

function ProjectsPage() {
  const { data, isLoading } = useProjects();
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

---

## Total API Count

| Category | Endpoints |
|----------|-----------|
| Authentication | 7 |
| User Management | 7 |
| Roles & Permissions | 7 |
| Staff Management | 9 |
| Departments | 6 |
| Attendance | 5 |
| Leave Management | 7 |
| Performance Reviews | 4 |
| Projects | 12 |
| Tasks | 9 |
| Sprints | 8 |
| Milestones | 5 |
| Pipelines | 10 |
| Automations | 5 |
| Chat | 15 |
| Announcements | 8 |
| Notifications | 7 |
| Culture | 15 |
| Clients & CRM | 23 |
| Finance | 20 |
| Audit & Compliance | 7 |
| File Upload | 2 |
| WebSocket | 1 |
| **Total** | **194** |

---

*Generated for SyncWork Frontend Development*
