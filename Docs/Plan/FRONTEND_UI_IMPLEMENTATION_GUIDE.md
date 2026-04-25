# SyncWork UI Implementation Guide

## Table of Contents
1. [Design System](#design-system)
2. [Component Architecture](#component-architecture)
3. [State Management with Zustand](#state-management-with-zustand)
4. [Tanstack Query Integration](#tanstack-query-integration)
5. [Page Implementations by Domain](#page-implementations-by-domain)
6. [Modern UI Patterns](#modern-ui-patterns)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [Performance Optimization](#performance-optimization)

---

## Design System

### Color Palette
```css
:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.148 0.004 228.8);
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.148 0.004 228.8);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.148 0.004 228.8);
	--primary: oklch(0.5 0.134 242.749);
	--primary-foreground: oklch(0.977 0.013 236.62);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.963 0.002 197.1);
	--muted-foreground: oklch(0.56 0.021 213.5);
	--accent: oklch(0.963 0.002 197.1);
	--accent-foreground: oklch(0.218 0.008 223.9);
	--destructive: oklch(0.577 0.245 27.325);
	--border: oklch(0.925 0.005 214.3);
	--input: oklch(0.925 0.005 214.3);
	--ring: oklch(0.723 0.014 214.4);
	--chart-1: oklch(0.905 0.182 98.111);
	--chart-2: oklch(0.795 0.184 86.047);
	--chart-3: oklch(0.681 0.162 75.834);
	--chart-4: oklch(0.554 0.135 66.442);
	--chart-5: oklch(0.476 0.114 61.907);
	--radius: 0.625rem;
	--sidebar: oklch(0.987 0.002 197.1);
	--sidebar-foreground: oklch(0.148 0.004 228.8);
	--sidebar-primary: oklch(0.588 0.158 241.966);
	--sidebar-primary-foreground: oklch(0.977 0.013 236.62);
	--sidebar-accent: oklch(0.963 0.002 197.1);
	--sidebar-accent-foreground: oklch(0.218 0.008 223.9);
	--sidebar-border: oklch(0.925 0.005 214.3);
	--sidebar-ring: oklch(0.723 0.014 214.4);
}

.dark {
	--background: oklch(0.148 0.004 228.8);
	--foreground: oklch(0.987 0.002 197.1);
	--card: oklch(0.218 0.008 223.9);
	--card-foreground: oklch(0.987 0.002 197.1);
	--popover: oklch(0.218 0.008 223.9);
	--popover-foreground: oklch(0.987 0.002 197.1);
	--primary: oklch(0.443 0.11 240.79);
	--primary-foreground: oklch(0.977 0.013 236.62);
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.275 0.011 216.9);
	--muted-foreground: oklch(0.723 0.014 214.4);
	--accent: oklch(0.275 0.011 216.9);
	--accent-foreground: oklch(0.987 0.002 197.1);
	--destructive: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.56 0.021 213.5);
	--chart-1: oklch(0.905 0.182 98.111);
	--chart-2: oklch(0.795 0.184 86.047);
	--chart-3: oklch(0.681 0.162 75.834);
	--chart-4: oklch(0.554 0.135 66.442);
	--chart-5: oklch(0.476 0.114 61.907);
	--sidebar: oklch(0.218 0.008 223.9);
	--sidebar-foreground: oklch(0.987 0.002 197.1);
	--sidebar-primary: oklch(0.685 0.169 237.323);
	--sidebar-primary-foreground: oklch(0.293 0.066 243.157);
	--sidebar-accent: oklch(0.275 0.011 216.9);
	--sidebar-accent-foreground: oklch(0.987 0.002 197.1);
	--sidebar-border: oklch(1 0 0 / 10%);
	--sidebar-ring: oklch(0.56 0.021 213.5);
}
```

### Typography Scale
```typescript
// components/ui/typography.tsx
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', className)}>
      {children}
    </h1>
  );
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn('scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0', className)}>
      {children}
    </h2>
  );
}

export function H3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function Body({ children, className }: TypographyProps) {
  return (
    <p className={cn('leading-7', className)}>
      {children}
    </p>
  );
}

export function Small({ children, className }: TypographyProps) {
  return (
    <small className={cn('text-sm font-medium leading-none', className)}>
      {children}
    </small>
  );
}
```

### Spacing System
```css
/* Using Tailwind spacing scale */
/* Base unit: 0.25rem (4px) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
```

---

## Component Architecture

### Layout Components

#### Sidebar Navigation
```typescript
// components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  MessageSquare,
  Calendar,
  Shield,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Staff & HR', href: '/staff', icon: Users },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Communication', href: '/communication', icon: MessageSquare },
  { name: 'Culture', href: '/culture', icon: Calendar },
  { name: 'Audit', href: '/audit', icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-background md:block w-64">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-primary">Sync</span>Work
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Button
                key={item.name}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive && 'bg-secondary'
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start gap-3">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}
```

#### Top Navigation Bar
```typescript
// components/layout/topbar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Search, Menu } from 'lucide-react';
import { useUnreadCount } from '@/hooks/use-communication';
import { useAuthStore } from '@/stores/auth-store';

export function TopBar() {
  const { data: unreadCount } = useUnreadCount();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount?.data > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {unreadCount.data}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                  <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log out</DropdownItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
```

#### Dashboard Layout
```typescript
// app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## State Management with Zustand

### Auth Store
```typescript
// stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (tokens: { access_token: string; refresh_token: string }) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setAuth: (tokens) =>
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
          isLoading: false,
        }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### UI Store
```typescript
// stores/ui-store.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: 'system',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
```

### Notification Store
```typescript
// stores/notification-store.ts
import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    
    // Auto remove
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, notification.duration || 5000);
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
```

---

## Tanstack Query Integration

### Query Provider
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
            staleTime: 60 * 1000,
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

### Query Keys Convention
```typescript
// lib/query-keys.ts
export const queryKeys = {
  auth: {
    me: ['me'],
  },
  users: {
    all: ['users'],
    detail: (id: string) => ['users', id],
  },
  staff: {
    all: ['employees'],
    detail: (id: string) => ['employees', id],
    departments: ['departments'],
    attendance: ['attendance'],
    leaves: ['leaves'],
  },
  projects: {
    all: ['projects'],
    detail: (id: string) => ['projects', id],
    tasks: (projectId: string) => ['tasks', projectId],
    sprints: (projectId: string) => ['sprints', projectId],
  },
  clients: {
    all: ['clients'],
    expenses: ['expenses'],
    budgets: ['budgets'],
  },
  communication: {
    rooms: ['rooms'],
    messages: (roomId: string) => ['messages', roomId],
    announcements: ['announcements'],
    notifications: ['notifications'],
  },
  culture: {
    events: ['events'],
    polls: ['polls'],
    recognitions: ['recognitions'],
    leaderboard: ['leaderboard'],
  },
};
```

---

## Page Implementations by Domain

### 1. Dashboard Overview

```typescript
// app/(dashboard)/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { H2 } from '@/components/ui/typography';
import { useProjects } from '@/hooks/use-projects';
import { useEmployees } from '@/hooks/use-staff';
import { useClients } from '@/hooks/use-clients';
import { useEvents } from '@/hooks/use-culture';
import {
  FolderKanban,
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: projects } = useProjects();
  const { data: employees } = useEmployees();
  const { data: clients } = useClients();
  const { data: events } = useEvents();

  const stats = [
    {
      title: 'Total Projects',
      value: projects?.pagination?.total || 0,
      icon: FolderKanban,
      trend: '+12%',
      color: 'text-blue-600',
    },
    {
      title: 'Employees',
      value: employees?.pagination?.total || 0,
      icon: Users,
      trend: '+5%',
      color: 'text-green-600',
    },
    {
      title: 'Clients',
      value: clients?.pagination?.total || 0,
      icon: Building2,
      trend: '+8%',
      color: 'text-purple-600',
    },
    {
      title: 'Upcoming Events',
      value: events?.pagination?.total || 0,
      icon: Calendar,
      trend: '+2',
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <H2>Dashboard</H2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.trend}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Recent Projects</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="space-y-4">
          <RecentProjects />
        </TabsContent>
        <TabsContent value="tasks">
          <MyTasks />
        </TabsContent>
        <TabsContent value="announcements">
          <RecentAnnouncements />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 2. Staff & HR Page

```typescript
// app/(dashboard)/staff/page.tsx
'use client';

import { useState } from 'react';
import { H2 } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEmployees, useCreateEmployee } from '@/hooks/use-staff';
import { EmployeeForm } from '@/components/forms/employee-form';
import { Search, Plus, Mail, Phone } from 'lucide-react';

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();

  const filteredEmployees = employees?.data?.filter(
    (employee: Employee) =>
      employee.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H2>Staff & HR</H2>
          <p className="text-muted-foreground">Manage employees, departments, and attendance.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Fill in the employee details below.
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm
              onSubmit={async (data) => {
                await createEmployee.mutateAsync(data);
                setIsCreateOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredEmployees?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees?.map((employee: Employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.avatar_url} />
                        <AvatarFallback>{employee.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.full_name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.employee_code}</TableCell>
                  <TableCell>{employee.department?.name}</TableCell>
                  <TableCell>{employee.job_title}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

### 3. Projects Page with Kanban Board

```typescript
// app/(dashboard)/projects/page.tsx
'use client';

import { useState } from 'react';
import { H2 } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProjects, useCreateProject } from '@/hooks/use-projects';
import { ProjectForm } from '@/components/forms/project-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Calendar, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export default function ProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H2>Projects</H2>
          <p className="text-muted-foreground">Manage projects, tasks, and sprints.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              onSubmit={async (data) => {
                await createProject.mutateAsync(data);
                setIsCreateOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects?.data?.map((project: Project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                    {project.status}
                  </Badge>
                </div>
                <Badge variant="outline" className={priorityColors[project.priority as keyof typeof priorityColors]}>
                  {project.priority}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} />
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(project.end_date || '').toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    5 members
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### 4. Chat/Communication Page

```typescript
// app/(dashboard)/communication/page.tsx
'use client';

import { useState } from 'react';
import { H2 } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRooms, useMessages, useSendMessage } from '@/hooks/use-communication';
import { Send, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CommunicationPage() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  
  const { data: rooms } = useRooms();
  const { data: messages } = useMessages(selectedRoom || '');
  const sendMessage = useSendMessage(selectedRoom || '');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    await sendMessage.mutateAsync({ content: messageInput });
    setMessageInput('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Rooms Sidebar */}
      <div className="w-64 border rounded-lg bg-card">
        <div className="p-4 border-b">
          <H2 className="text-lg">Channels</H2>
        </div>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-2 space-y-1">
            {rooms?.data?.map((room: ChatRoom) => (
              <Button
                key={room.id}
                variant={selectedRoom === room.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => setSelectedRoom(room.id)}
              >
                <Hash className="h-4 w-4" />
                {room.name}
                {room.unread_count > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {room.unread_count}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col border rounded-lg bg-card">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b">
              <h3 className="font-semibold">
                {rooms?.data?.find((r: ChatRoom) => r.id === selectedRoom)?.name}
              </h3>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages?.data?.map((message: Message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender?.avatar_url} />
                      <AvatarFallback>{message.sender?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.sender?.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a channel to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Modern UI Patterns

### Data Table with Sorting & Filtering
```typescript
// components/data-table.tsx
'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      {searchColumn && (
        <Input
          placeholder="Search..."
          value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn(searchColumn)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          header.column.toggleSorting(header.column.getIsSorted() === 'asc')
                        }
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

### Stats Card Component
```typescript
// components/stats-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendUp = true,
  className,
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground">
            {trend && (
              <span className={cn('font-medium', trendUp ? 'text-green-600' : 'text-red-600')}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            )}
            {description && ` ${description}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Status Badge Component
```typescript
// components/status-badge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Active' },
  pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
  completed: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' },
  on_hold: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'On Hold' },
  approved: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  
  return (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        size === 'sm' && 'text-xs px-1.5 py-0',
        size === 'lg' && 'text-sm px-3 py-1'
      )}
    >
      {config.label}
    </Badge>
  );
}
```

---

## Responsive Design

### Breakpoints
```css
/* Tailwind default breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Responsive Patterns
```typescript
// Mobile-first responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map((item) => (
    <Card key={item.id}>{/* content */}</Card>
  ))}
</div>

// Responsive sidebar
<div className={cn(
  "fixed inset-y-0 left-0 z-50 w-64 bg-background transform transition-transform duration-200",
  sidebarOpen ? "translate-x-0" : "-translate-x-full",
  "md:relative md:translate-x-0"
)}>
  {/* Sidebar content */}
</div>

// Responsive table
<div className="overflow-x-auto">
  <Table>{/* table content */}</Table>
</div>
```

---

## Accessibility

### Focus Management
```typescript
// hooks/use-focus-trap.ts
import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}
```

### ARIA Labels
```typescript
// Accessible button with loading state
<Button
  aria-label={isLoading ? 'Loading...' : 'Submit form'}
  aria-disabled={isLoading}
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      <span>Loading...</span>
    </>
  ) : (
    'Submit'
  )}
</Button>
```

---

## Performance Optimization

### Image Optimization
```typescript
import Image from 'next/image';

// Use Next.js Image component for automatic optimization
<Image
  src={user.avatar_url}
  alt={user.full_name}
  width={40}
  height={40}
  className="rounded-full"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Code Splitting
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/charts/heavy-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
});
```

### Memoization
```typescript
import { memo, useMemo } from 'react';

// Memoize expensive computations
const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  const processedData = useMemo(() => {
    return data.map((item) => expensiveTransform(item));
  }, [data]);

  return <div>{/* render processedData */}</div>;
});
```

### Virtualization for Long Lists
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Testing

### Component Testing with React Testing Library
```typescript
// __tests__/components/login-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/forms/login-form';

const mockLogin = jest.fn();

jest.mock('@/hooks/use-auth', () => ({
  useLogin: () => ({
    mutateAsync: mockLogin,
    isPending: false,
  }),
}));

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

---

## Deployment

### Build Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
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

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

---

## Resources

### shadcn/ui Components Used
- Button, Card, Dialog, Form, Input, Label
- Select, Table, Tabs, Toast
- Avatar, Badge, Progress, ScrollArea
- Dropdown Menu, Calendar, Popover
- Skeleton, Separator, Switch

### Recommended Libraries
- **Forms**: react-hook-form + zod
- **Dates**: date-fns
- **Charts**: recharts or chart.js
- **Maps**: react-leaflet (if needed)
- **Drag & Drop**: @dnd-kit/core
- **Virtualization**: @tanstack/react-virtual
- **Testing**: vitest + @testing-library/react

### Icons
All icons from **Lucide React**:
```bash
npm install lucide-react
```

### Color System
Using Tailwind CSS with CSS variables for theming support.

---

## Support

- **Backend API**: http://localhost:8080/swagger/index.html
- **Frontend Repo**: [Your frontend repo]
- **Issues**: https://github.com/asthrix/sync-work-server/issues
