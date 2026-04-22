# Office Management System - Frontend Architecture

## Executive Summary

This document presents a comprehensive, industry-standard frontend architecture for the Office Management System. Built on Next.js 14+ with the App Router, this architecture delivers a modern, type-safe, performant, and accessible user interface. The design follows clean architecture principles with clear separation of concerns, modular feature organization, and robust state management.

**Architecture Pattern**: Modular Feature-Based Architecture with Clean Architecture principles  
**Rendering Strategy**: Hybrid (Server Components default, Client Components for interactivity)  
**State Management**: Server State (TanStack Query) + Client State (Zustand)  
**Styling Strategy**: Tailwind CSS + shadcn/ui components + CSS variables for theming  
**Deployment Target**: Cloudflare Workers (Edge Runtime)

---

## Table of Contents

1. [Architecture Principles](#1-architecture-principles)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Project Structure](#4-project-structure)
5. [Module Architecture](#5-module-architecture)
6. [State Management Strategy](#6-state-management-strategy)
7. [Data Fetching Patterns](#7-data-fetching-patterns)
8. [Component Architecture](#8-component-architecture)
9. [Form Management](#9-form-management)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Real-Time Communication](#11-real-time-communication)
12. [Theming & UI System](#12-theming--ui-system)
13. [Performance Strategy](#13-performance-strategy)
14. [Error Handling](#14-error-handling)
15. [Deployment Architecture](#15-deployment-architecture)
16. [Development Workflow](#16-development-workflow)
17. [Implementation Roadmap](#17-implementation-roadmap)

---

## 1. Architecture Principles

### 1.1 Core Principles

| Principle | Implementation |
|-----------|---------------|
| **Server-First Rendering** | Use Server Components by default; Client Components only for interactivity |
| **Colocation** | Keep components, hooks, types, and utilities close to features |
| **Type Safety** | End-to-end type safety with TypeScript, Zod schemas, and generated API types |
| **Progressive Enhancement** | Core functionality works without JavaScript; enhanced with JS |
| **Accessibility First** | WCAG 2.1 AA compliance, keyboard navigation, screen reader support |
| **Performance Budget** | First Load JS < 200KB per route, TTI < 3s, CLS < 0.1 |

### 1.2 Architectural Decision Records

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 14+ App Router | Server Components, nested layouts, streaming, edge-ready |
| **Components** | shadcn/ui | Headless, accessible, customizable, built on Radix UI |
| **State (Server)** | TanStack Query | Caching, background updates, optimistic updates, devtools |
| **State (Client)** | Zustand | Lightweight, TypeScript-friendly, no boilerplate |
| **Forms** | React Hook Form + Zod | Performance, validation, type safety |
| **Styling** | Tailwind CSS | Utility-first, minimal CSS bundle, design system friendly |
| **Deployment** | Cloudflare Workers | Edge runtime, global CDN, DDoS protection, cost-effective |

---

## 2. Technology Stack

### 2.1 Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    
    "@tanstack/react-query": "^5.28.0",
    "@tanstack/react-query-devtools": "^5.28.0",
    "@tanstack/react-virtual": "^3.2.0",
    "@tanstack/react-table": "^8.15.0",
    
    "zustand": "^4.5.0",
    "zustand/middleware": "^4.5.0",
    
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    
    "next-themes": "^0.3.0",
    "sonner": "^1.4.0",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "react-day-picker": "^8.10.0",
    
    "@hello-pangea/dnd": "^16.6.0",
    "recharts": "^2.12.0",
    
    "@cloudflare/next-on-pages": "^1.11.0",
    "wrangler": "^3.50.0"
  }
}
```

### 2.2 Development Dependencies

```json
{
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "@typescript-eslint/eslint-plugin": "^7.5.0",
    
    "prettier": "^3.2.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    
    "@testing-library/react": "^14.2.0",
    "@testing-library/jest-dom": "^6.4.0",
    "vitest": "^1.5.0",
    "@vitejs/plugin-react": "^4.2.0",
    
    "playwright": "^1.43.0",
    "msw": "^2.2.0"
  }
}
```

### 2.3 Additional Recommended Libraries

| Library | Purpose | Justification |
|---------|---------|---------------|
| **@hello-pangea/dnd** | Drag-and-drop | Modern replacement for react-beautiful-dnd, Kanban boards |
| **recharts** | Data visualization | Charts for dashboards, payroll, project metrics |
| **sonner** | Toast notifications | Better API than react-hot-toast, beautiful UI |
| **cmdk** | Command palette | Spotlight-style search, keyboard navigation |
| **date-fns** | Date manipulation | Tree-shakeable, immutable, better than moment.js |
| **react-day-picker** | Date pickers | Accessible, customizable, works with date-fns |
| **usehooks-ts** | Utility hooks | battle-tested hooks (useDebounce, useLocalStorage, etc.) |
| **jotai** | Atomic state (optional) | For complex derived state if Zustand becomes insufficient |

---

## 3. High-Level Architecture

### 3.1 Rendering Strategy

```
Request Flow (Cloudflare Edge)
│
├─ Static Route ──> CDN Cache ──> Static HTML
│
├─ Dynamic Route ──> Cloudflare Worker ──> Next.js Runtime
│                        │
│                        ├─ Server Component ──> Fetch Data ──> Render HTML
│                        │                           │
│                        │                           ├─ Cache (TanStack Query hydration)
│                        │                           └─ Stream to Client
│                        │
│                        └─ Client Component ──> Hydrate ──> Interactive
│                                                    │
│                                                    ├─ Zustand Store
│                                                    ├─ TanStack Query
│                                                    └─ WebSocket Connection
│
└─ API Route ──> Cloudflare Worker ──> Backend API Proxy
```

### 3.2 Component Types

| Type | Extension | Use Case | Data Fetching |
|------|-----------|----------|---------------|
| **Server Component** | `.tsx` (default) | Static content, data fetching, SEO | Direct `fetch()` or DB calls |
| **Client Component** | `.client.tsx` or `'use client'` | Interactivity, browser APIs, hooks | TanStack Query hooks |
| **Server Action** | `async function` with `'use server'` | Form submissions, mutations | Direct backend calls |
| **API Route** | `route.ts` | Proxy to backend, file uploads | Backend API |

### 3.3 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │    Pages     │  │   Layouts    │  │   Loading    │  │   Error     │ │
│  │   (App)      │  │  (Nested)    │  │   States     │  │  Boundaries │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │        │
├─────────┴─────────────────┴─────────────────┴─────────────────┴────────┤
│                         FEATURE LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Components  │  │    Hooks     │  │    Stores    │  │    Types    │ │
│  │   (UI +      │  │  (Data +     │  │  (Zustand    │  │  (Zod +     │ │
│  │   Business)  │  │   Logic)     │  │   Slices)    │  │   TS)       │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │        │
├─────────┴─────────────────┴─────────────────┴─────────────────┴────────┤
│                         DATA LAYER                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    TanStack Query Client                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │  │
│  │  │  Queries │  │Mutations │  │Infinite  │  │   Optimistic     │ │  │
│  │  │          │  │          │  │ Queries  │  │   Updates        │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
├──────────────────────────────┼──────────────────────────────────────────┤
│                         API LAYER                                       │
│  ┌──────────────┐  ┌────────┴───────┐  ┌──────────────┐               │
│  │   REST API   │  │  WebSocket     │  │Server Actions│               │
│  │   Client     │  │   Client       │  │              │               │
│  └──────────────┘  └────────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Project Structure

### 4.1 Directory Layout

```
office-management-frontend/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth group (no sidebar)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/                  # Dashboard group (with sidebar)
│   │   ├── layout.tsx                # Dashboard shell with sidebar, header
│   │   ├── page.tsx                  # Dashboard home
│   │   │
│   │   ├── staff/                    # Staff Management Module
│   │   │   ├── page.tsx              # Staff list (Server Component)
│   │   │   ├── loading.tsx           # Loading UI
│   │   │   ├── error.tsx             # Error boundary
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx          # Staff detail
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── documents/
│   │   │   │       └── page.tsx
│   │   │   ├── departments/
│   │   │   │   └── page.tsx
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx
│   │   │   └── leaves/
│   │   │       └── page.tsx
│   │   │
│   │   ├── projects/                 # Project Management Module
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tasks/
│   │   │   │   ├── sprints/
│   │   │   │   └── settings/
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   │
│   │   ├── pipeline/                 # Pipeline/Kanban Module
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── clients/                  # Client Management Module
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   └── contracts/
│   │   │       └── page.tsx
│   │   │
│   │   ├── payroll/                  # Payroll Module
│   │   │   ├── page.tsx
│   │   │   ├── [cycleId]/
│   │   │   └── my-payslips/
│   │   │       └── page.tsx
│   │   │
│   │   ├── chat/                     # Chat Module
│   │   │   ├── page.tsx              # Chat home
│   │   │   └── [roomId]/
│   │   │       └── page.tsx          # Specific room
│   │   │
│   │   ├── announcements/            # Announcements Module
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── events/                   # Culture & Events Module
│   │   │   ├── page.tsx
│   │   │   ├── trips/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── audit/                    # Audit Module (Admin only)
│   │   │   └── page.tsx
│   │   │
│   │   └── settings/                 # User Settings
│   │       ├── profile/
│   │       ├── notifications/
│   │       └── security/
│   │
│   ├── api/                          # API Routes (proxy to backend)
│   │   ├── auth/
│   │   │   └── [...nextauth]/        # Or custom auth endpoints
│   │   ├── upload/
│   │   │   └── route.ts              # File upload proxy
│   │   └── websocket/
│   │       └── route.ts              # WebSocket upgrade
│   │
│   ├── layout.tsx                    # Root layout
│   ├── loading.tsx                   # Global loading
│   ├── error.tsx                     # Global error boundary
│   ├── not-found.tsx                 # 404 page
│   └── globals.css                   # Global styles + Tailwind
│
├── components/                       # Shared components
│   ├── ui/                          # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx                  # Form wrapper components
│   │   └── ...
│   │
│   ├── layout/                      # Layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── command-menu.tsx          # CMD+K search
│   │   └── notifications-popover.tsx
│   │
│   ├── data-table/                  # Reusable data table
│   │   ├── data-table.tsx
│   │   ├── columns.tsx
│   │   ├── pagination.tsx
│   │   ├── filtering.tsx
│   │   └── sorting.tsx
│   │
│   ├── kanban/                      # Kanban board components
│   │   ├── board.tsx
│   │   ├── column.tsx
│   │   ├── card.tsx
│   │   └── drag-context.tsx
│   │
│   ├── charts/                      # Chart components
│   │   ├── bar-chart.tsx
│   │   ├── line-chart.tsx
│   │   └── pie-chart.tsx
│   │
│   └── providers/                   # Context providers
│       ├── query-provider.tsx
│       ├── theme-provider.tsx
│       ├── auth-provider.tsx
│       └── websocket-provider.tsx
│
├── lib/                             # Utilities and configurations
│   ├── api/                         # API client configuration
│   │   ├── client.ts                # Axios/fetch wrapper
│   │   ├── interceptors.ts          # Request/response interceptors
│   │   ├── types.ts                 # API response types
│   │   └── endpoints.ts             # API endpoint definitions
│   │
│   ├── hooks/                       # Global hooks
│   │   ├── use-auth.ts
│   │   ├── use-permissions.ts
│   │   ├── use-notifications.ts
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   └── use-media-query.ts
│   │
│   ├── stores/                      # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts              # Sidebar, modals, toasts
│   │   ├── chat-store.ts
│   │   └── notification-store.ts
│   │
│   ├── validators/                  # Zod schemas
│   │   ├── auth.ts
│   │   ├── staff.ts
│   │   ├── project.ts
│   │   └── common.ts
│   │
│   ├── utils/
│   │   ├── cn.ts                    # tailwind-merge + clsx
│   │   ├── format.ts                # Date, currency, number formatting
│   │   ├── permissions.ts           # Permission checking helpers
│   │   └── export.ts                # CSV/Excel/PDF export
│   │
│   └── constants/
│       ├── routes.ts                # Route definitions
│       ├── permissions.ts           # Permission constants
│       └── config.ts                # App configuration
│
├── features/                        # Feature modules (colocation)
│   ├── staff/
│   │   ├── components/
│   │   │   ├── staff-table.tsx
│   │   │   ├── staff-form.tsx
│   │   │   ├── staff-card.tsx
│   │   │   └── department-tree.tsx
│   │   ├── hooks/
│   │   │   ├── use-staff.ts
│   │   │   ├── use-staff-list.ts
│   │   │   └── use-departments.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   │
│   ├── projects/
│   │   ├── components/
│   │   │   ├── project-board.tsx
│   │   │   ├── task-card.tsx
│   │   │   ├── sprint-form.tsx
│   │   │   └── time-tracker.tsx
│   │   ├── hooks/
│   │   │   ├── use-projects.ts
│   │   │   ├── use-tasks.ts
│   │   │   └── use-sprints.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   │
│   ├── chat/
│   │   ├── components/
│   │   │   ├── chat-room.tsx
│   │   │   ├── message-list.tsx
│   │   │   ├── message-input.tsx
│   │   │   └── emoji-picker.tsx
│   │   ├── hooks/
│   │   │   ├── use-chat.ts
│   │   │   ├── use-messages.ts
│   │   │   └── use-websocket.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   │
│   ├── payroll/
│   ├── clients/
│   ├── pipeline/
│   └── announcements/
│
├── types/                           # Global TypeScript types
│   ├── index.ts
│   ├── api.ts
│   └── models.ts
│
├── public/                          # Static assets
│   ├── images/
│   ├── fonts/
│   └── manifest.json
│
├── styles/
│   └── themes.css                   # Custom theme variables
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local
├── .env.production
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── vitest.config.ts
├── playwright.config.ts
├── wrangler.toml                    # Cloudflare Workers config
└── package.json
```

---

## 5. Module Architecture

### 5.1 Module Structure Pattern

Every feature module follows this structure:

```
features/{module}/
├── components/           # Module-specific components
│   ├── {feature}-list.tsx
│   ├── {feature}-form.tsx
│   ├── {feature}-detail.tsx
│   └── {feature}-card.tsx
├── hooks/                # Module-specific data hooks
│   ├── use-{feature}.ts
│   ├── use-{feature}-list.ts
│   └── use-{feature}-mutations.ts
├── types.ts              # Module-specific types
├── utils.ts              # Module-specific utilities
└── constants.ts          # Module constants
```

### 5.2 Feature Module Examples

#### Staff Management Module

```typescript
// features/staff/hooks/use-staff-list.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { StaffFilters, StaffListResponse } from '../types'

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filters: StaffFilters) => [...staffKeys.lists(), filters] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
}

export function useStaffList(filters: StaffFilters) {
  return useQuery({
    queryKey: staffKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get<StaffListResponse>('/staff', { params: filters })
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// features/staff/components/staff-table.tsx
'use client'

import { useStaffList } from '../hooks/use-staff-list'
import { DataTable } from '@/components/data-table'
import { columns } from './columns'

export function StaffTable({ filters }: { filters: StaffFilters }) {
  const { data, isLoading, error } = useStaffList(filters)
  
  if (isLoading) return <DataTable.Skeleton />
  if (error) return <DataTable.Error error={error} />
  
  return (
    <DataTable 
      data={data?.items ?? []} 
      columns={columns}
      pagination={data?.pagination}
    />
  )
}
```

#### Project Pipeline Module (Kanban)

```typescript
// features/pipeline/components/board.tsx
'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { usePipeline } from '../hooks/use-pipeline'
import { PipelineColumn } from './column'

export function PipelineBoard({ pipelineId }: { pipelineId: string }) {
  const { data, moveTask } = usePipeline(pipelineId)
  
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    moveTask.mutate({
      taskId: result.draggableId,
      sourceStageId: result.source.droppableId,
      targetStageId: result.destination.droppableId,
      position: result.destination.index,
    })
  }
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {data?.stages.map((stage) => (
          <Droppable key={stage.id} droppableId={stage.id}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <PipelineColumn stage={stage} />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  )
}
```

---

## 6. State Management Strategy

### 6.1 State Classification

| State Type | Storage | Tool | Examples |
|------------|---------|------|----------|
| **Server State** | Backend | TanStack Query | Staff list, projects, messages |
| **Global UI State** | Memory | Zustand | Sidebar open, modals, theme |
| **Global Auth State** | Memory + Cookie | Zustand | User, permissions, tokens |
| **Feature State** | Memory | Zustand | Chat drafts, filter preferences |
| **Persistent State** | localStorage | Zustand + persist | Table preferences, sidebar state |
| **URL State** | URL | nuqs / useSearchParams | Filters, pagination, tab selection |

### 6.2 TanStack Query Configuration

```typescript
// lib/api/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,           // 1 minute
      gcTime: 5 * 60 * 1000,          // 5 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        // Global error handler
        toast.error(error.message)
      },
    },
  },
})

// Prefetching pattern for Server Components
export async function prefetchStaff(filters: StaffFilters) {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: staffKeys.list(filters),
    queryFn: () => fetchStaff(filters),
  })
  return queryClient
}
```

### 6.3 Zustand Store Pattern

```typescript
// lib/stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Permission } from '@/types'

interface AuthState {
  user: User | null
  permissions: Permission[]
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setPermissions: (permissions: Permission[]) => void
  hasPermission: (permission: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setPermissions: (permissions) => set({ permissions }),
      hasPermission: (permission) => {
        const { permissions } = get()
        return permissions.some((p) => p === permission || p === '*')
      },
      logout: () => {
        set({ user: null, permissions: [], isAuthenticated: false })
        // Clear query cache
        queryClient.clear()
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user
    }
  )
)

// lib/stores/ui-store.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  commandMenuOpen: boolean
  notificationsOpen: boolean
  
  toggleSidebar: () => void
  toggleSidebarCollapse: () => void
  setCommandMenuOpen: (open: boolean) => void
  setNotificationsOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  commandMenuOpen: false,
  notificationsOpen: false,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
}))
```

---

## 7. Data Fetching Patterns

### 7.1 Server Component Data Fetching

```typescript
// app/(dashboard)/staff/page.tsx
import { prefetchStaff } from '@/features/staff/hooks/use-staff-list'
import { StaffTable } from '@/features/staff/components/staff-table'
import { StaffFilters } from '@/features/staff/types'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

interface StaffPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const filters: StaffFilters = {
    page: Number(searchParams.page) || 1,
    limit: Number(searchParams.limit) || 20,
    search: searchParams.search as string,
    department: searchParams.department as string,
    status: searchParams.status as string,
  }
  
  const queryClient = await prefetchStaff(filters)
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <StaffHeader />
        <StaffFilters />
        <StaffTable filters={filters} />
      </div>
    </HydrationBoundary>
  )
}
```

### 7.2 Client Component Data Fetching

```typescript
// features/projects/hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { projectKeys } from './keys'

export function useProjects(filters: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => api.get('/projects', { params: filters }).then((r) => r.data),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateProjectInput) => 
      api.post('/projects', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success('Project created successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Optimistic Update Example
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      api.patch(`/tasks/${taskId}/status`, { status }).then((r) => r.data),
    
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(taskId) })
      
      const previousTask = queryClient.getQueryData(taskKeys.detail(taskId))
      
      queryClient.setQueryData(taskKeys.detail(taskId), (old: Task) => ({
        ...old,
        status,
      }))
      
      return { previousTask }
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        taskKeys.detail(variables.taskId),
        context?.previousTask
      )
      toast.error('Failed to update task status')
    },
    
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) })
    },
  })
}
```

### 7.3 Infinite Query Pattern (Chat Messages)

```typescript
// features/chat/hooks/use-messages.ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useMessages(roomId: string) {
  return useInfiniteQuery({
    queryKey: ['messages', roomId],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get(`/chat/rooms/${roomId}/messages`, {
        params: { page: pageParam, limit: 50 },
      })
      return data
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page >= lastPage.pagination.totalPages) {
        return undefined
      }
      return lastPage.pagination.page + 1
    },
    initialPageParam: 1,
  })
}
```

---

## 8. Component Architecture

### 8.1 Component Hierarchy

```
Page (Server Component)
├── Layout (Server Component)
│   ├── Header (Client Component)
│   │   ├── SearchCommand (Client)
│   │   ├── NotificationsPopover (Client)
│   │   └── UserMenu (Client)
│   │
│   ├── Sidebar (Client Component)
│   │   ├── Navigation (Client)
│   │   └── TeamSwitcher (Client)
│   │
│   └── Main Content
│       ├── PageHeader (Server)
│       ├── Filters (Client)
│       ├── DataTable (Client)
│       │   ├── TableHeader
│       │   ├── TableBody
│       │   ├── TablePagination
│       │   └── TableToolbar
│       └── DetailDrawer (Client)
```

### 8.2 Component Patterns

#### Compound Component Pattern

```typescript
// components/data-table/data-table.tsx
'use client'

import { createContext, useContext } from 'react'
import { Table } from '@/components/ui/table'

interface DataTableContextValue<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading: boolean
}

const DataTableContext = createContext<DataTableContextValue<any> | null>(null)

function useDataTable<T>() {
  const context = useContext(DataTableContext)
  if (!context) throw new Error('Must be used within DataTable')
  return context as DataTableContextValue<T>
}

export function DataTable<T>({ data, columns, children }: DataTableProps<T>) {
  return (
    <DataTableContext.Provider value={{ data, columns, isLoading: false }}>
      <div className="rounded-md border">
        {children}
      </div>
    </DataTableContext.Provider>
  )
}

DataTable.Header = function DataTableHeader() {
  const { columns } = useDataTable()
  return (
    <Table.Header>
      <Table.Row>
        {columns.map((column) => (
          <Table.Head key={column.id}>{column.header}</Table.Head>
        ))}
      </Table.Row>
    </Table.Header>
  )
}

DataTable.Body = function DataTableBody() {
  const { data, columns, isLoading } = useDataTable()
  
  if (isLoading) return <DataTableSkeleton />
  
  return (
    <Table.Body>
      {data.map((row) => (
        <Table.Row key={row.id}>
          {columns.map((column) => (
            <Table.Cell key={column.id}>
              {column.cell(row)}
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </Table.Body>
  )
}

// Usage
<DataTable data={staff} columns={staffColumns}>
  <DataTable.Header />
  <DataTable.Body />
  <DataTable.Pagination />
</DataTable>
```

#### Slot Pattern

```typescript
// components/page-header.tsx
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// Usage
<PageHeader
  title="Staff Management"
  description="Manage your team members"
  actions={
    <>
      <Button variant="outline">Export</Button>
      <Button>Add Staff</Button>
    </>
  }
/>
```

---

## 9. Form Management

### 9.1 Form Architecture

```
Form Schema (Zod)
    ↓
React Hook Form (useForm)
    ↓
Field Components (shadcn/ui Form)
    ↓
Server Action / API Mutation
    ↓
Cache Invalidation + Toast
```

### 9.2 Form Implementation Pattern

```typescript
// lib/validators/staff.ts
import { z } from 'zod'

export const createStaffSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  departmentId: z.string().uuid('Please select a department'),
  roleId: z.string().uuid('Please select a role'),
  joinDate: z.date({ required_error: 'Join date is required' }),
  salary: z.number().positive('Salary must be positive'),
  status: z.enum(['active', 'probation', 'inactive']),
})

export type CreateStaffInput = z.infer<typeof createStaffSchema>

// features/staff/components/staff-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createStaffSchema, CreateStaffInput } from '@/lib/validators/staff'
import { useCreateStaff } from '../hooks/use-staff'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function StaffForm() {
  const createStaff = useCreateStaff()
  
  const form = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      status: 'active',
    },
  })
  
  const onSubmit = async (data: CreateStaffInput) => {
    await createStaff.mutateAsync(data)
    form.reset()
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create Staff'}
        </Button>
      </form>
    </Form>
  )
}
```

### 9.3 Server Action Form (Alternative)

```typescript
// app/(dashboard)/staff/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createStaffSchema } from '@/lib/validators/staff'

export async function createStaff(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = createStaffSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }
  
  try {
    await api.post('/staff', parsed.data)
    revalidatePath('/staff')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}
```

---

## 10. Authentication & Authorization

### 10.1 Authentication Flow

```
User enters credentials
        ↓
Client validates (Zod)
        ↓
POST /auth/login
        ↓
Backend validates + returns tokens
        ↓
Store tokens (httpOnly cookie for refresh, memory for access)
        ↓
Fetch user profile + permissions
        ↓
Store in Zustand auth store
        ↓
Invalidate queries + redirect to dashboard
```

### 10.2 Authentication Implementation

```typescript
// lib/api/client.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add access token
api.interceptors.request.use((config) => {
  const token = getAccessToken() // From cookie or memory
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const newToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// lib/hooks/use-auth.ts
export function useAuth() {
  const { user, isAuthenticated, logout } = useAuthStore()
  
  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post('/auth/login', credentials)
      return data
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      useAuthStore.getState().setUser(data.user)
      useAuthStore.getState().setPermissions(data.permissions)
      queryClient.invalidateQueries()
      router.push('/dashboard')
    },
  })
  
  return { user, isAuthenticated, login, logout }
}

// components/permission-gate.tsx
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission } = useAuthStore()
  
  if (!hasPermission(permission)) {
    return fallback
  }
  
  return children
}

// Usage
<PermissionGate permission="staff:write">
  <Button>Add Staff</Button>
</PermissionGate>
```

---

## 11. Real-Time Communication

### 11.1 WebSocket Architecture

```typescript
// lib/websocket/client.ts
export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  
  connect() {
    const token = getAccessToken()
    this.ws = new WebSocket(`${WS_URL}?token=${token}`)
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      console.log('WebSocket connected')
    }
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.emit(message.type, message.payload)
    }
    
    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.connect(), 1000 * 2 ** this.reconnectAttempts)
        this.reconnectAttempts++
      }
    }
  }
  
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    
    return () => this.listeners.get(event)?.delete(callback)
  }
  
  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data))
  }
  
  send(type: string, payload: any) {
    this.ws?.send(JSON.stringify({ type, payload }))
  }
}

export const wsClient = new WebSocketClient()

// components/providers/websocket-provider.tsx
'use client'

import { useEffect } from 'react'
import { wsClient } from '@/lib/websocket/client'

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    wsClient.connect()
    return () => wsClient.disconnect()
  }, [])
  
  return children
}

// features/chat/hooks/use-websocket-chat.ts
export function useWebSocketChat(roomId: string) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const unsubscribe = wsClient.on('message', (message) => {
      if (message.roomId === roomId) {
        // Optimistically add to cache
        queryClient.setQueryData(['messages', roomId], (old: any) => ({
          ...old,
          pages: [
            {
              ...old.pages[0],
              items: [message, ...old.pages[0].items],
            },
            ...old.pages.slice(1),
          ],
        }))
      }
    })
    
    return unsubscribe
  }, [roomId, queryClient])
  
  const sendMessage = useCallback((content: string) => {
    wsClient.send('message', { roomId, content })
  }, [roomId])
  
  return { sendMessage }
}
```

---

## 12. Theming & UI System

### 12.1 Design Token System

```css
/* styles/themes.css */
@layer base {
  :root {
    /* Base colors */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    /* Brand colors */
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    
    /* Semantic colors */
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    /* Status colors */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --success: 142.1 76.2% 36.3%;
    --success-foreground: 355.7 100% 97.3%;
    --warning: 38 92% 50%;
    --warning-foreground: 48 96% 89%;
    --info: 221.2 83.2% 53.3%;
    --info-foreground: 210 40% 98%;
    
    /* UI elements */
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

### 12.2 Component Customization

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

---

## 13. Performance Strategy

### 13.1 Optimization Techniques

| Technique | Implementation | Impact |
|-----------|---------------|--------|
| **Server Components** | Default to Server Components | Zero JS bundle for static content |
| **Code Splitting** | Dynamic imports for heavy components | Reduced initial bundle |
| **Image Optimization** | Next.js Image component | Automatic WebP, lazy loading |
| **Font Optimization** | next/font | Zero layout shift |
| **Route Prefetching** | next/link | Instant navigation |
| **Virtual Scrolling** | @tanstack/react-virtual | Handle large lists (staff, messages) |
| **Memoization** | React.memo, useMemo, useCallback | Prevent unnecessary re-renders |
| **Debouncing** | useDebounce for search inputs | Reduce API calls |
| **Prefetching** | TanStack Query prefetch | Instant data on navigation |

### 13.2 Bundle Analysis

```javascript
// next.config.js
const nextConfig = {
  output: 'export', // For Cloudflare Workers
  
  // Bundle analyzer (run with ANALYZE=true)
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      )
    }
    return config
  },
  
  // Image optimization for static export
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

### 13.3 Virtual Scrolling Implementation

```typescript
// features/chat/components/message-list.tsx
'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { useMessages } from '../hooks/use-messages'

export function MessageList({ roomId }: { roomId: string }) {
  const { data, fetchNextPage, hasNextPage } = useMessages(roomId)
  const parentRef = useRef<HTMLDivElement>(null)
  
  const messages = data?.pages.flatMap((page) => page.items) ?? []
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <MessageItem message={messages[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 14. Error Handling

### 14.1 Error Boundary Strategy

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error tracking service
    console.error(error)
  }, [error])
  
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}

// app/(dashboard)/staff/error.tsx
'use client'

export default function StaffErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="rounded-lg border border-destructive/50 p-6">
      <h3 className="text-lg font-semibold text-destructive">
        Failed to load staff data
      </h3>
      <p className="text-sm text-muted-foreground mt-2">
        {error.message}
      </p>
      <Button onClick={reset} variant="outline" className="mt-4">
        Retry
      </Button>
    </div>
  )
}
```

### 14.2 API Error Handling

```typescript
// lib/api/error-handler.ts
import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleApiError(error: AxiosError) {
  const status = error.response?.status
  const data = error.response?.data as ApiErrorResponse
  
  switch (status) {
    case 400:
      toast.error('Invalid request', {
        description: data?.error?.message || 'Please check your input',
      })
      break
    case 401:
      toast.error('Session expired', {
        description: 'Please log in again',
      })
      window.location.href = '/login'
      break
    case 403:
      toast.error('Access denied', {
        description: 'You do not have permission to perform this action',
      })
      break
    case 404:
      toast.error('Not found')
      break
    case 422:
      // Validation errors handled by form
      break
    case 429:
      toast.error('Too many requests', {
        description: 'Please wait a moment and try again',
      })
      break
    case 500:
      toast.error('Server error', {
        description: 'Something went wrong on our end',
      })
      break
    default:
      toast.error('An error occurred')
  }
  
  return Promise.reject(error)
}
```

---

## 15. Deployment Architecture

### 15.1 Cloudflare Workers Configuration

```toml
# wrangler.toml
name = "office-management-frontend"
main = "./dist/_worker.js"
compatibility_date = "2024-04-01"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = "./dist"

[build]
command = "npm run build"

# Environment variables (use wrangler secret for sensitive values)
[vars]
NEXT_PUBLIC_API_URL = "https://api.office-management.com"
NEXT_PUBLIC_WS_URL = "wss://ws.office-management.com"
NEXT_PUBLIC_APP_URL = "https://app.office-management.com"

# Routes
[[routes]]
pattern = "app.office-management.com/*"
custom_domain = true

# Caching rules
[[rules]]
 type = "CacheRule"
 action = "Cache"
 match = "*.js,*.css,*.woff2,*.png,*.jpg"
 ttl = 86400
```

### 15.2 Build Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  
  // Required for Cloudflare Workers
  images: {
    unoptimized: true,
  },
  
  // Trailing slashes for static export
  trailingSlash: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
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
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### 15.3 Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=office-management-frontend
```

### 15.4 Environment Strategy

| Environment | URL | Purpose | Deploy Trigger |
|-------------|-----|---------|----------------|
| **Development** | `localhost:3000` | Local development | Manual |
| **Staging** | `staging.app.company.com` | QA, UAT | Push to `develop` |
| **Production** | `app.company.com` | Live application | Push to `main` |

---

## 16. Development Workflow

### 16.1 Code Quality Tools

```javascript
// eslint.config.js
import nextPlugin from '@next/eslint-plugin-next'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@next': nextPlugin,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Next.js specific
      '@next/next/no-html-link-for-pages': 'error',
      
      // TypeScript
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      
      // General
      'no-console': ['warn', { allow: ['error'] }],
      'prefer-const': 'error',
    },
  },
]
```

```javascript
// prettier.config.js
module.exports = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['clsx', 'cn'],
}
```

### 16.2 Git Workflow

```
main (production)
  ↑
develop (integration)
  ↑
feature/staff-management
feature/project-kanban
bugfix/login-redirect
```

### 16.3 Testing Strategy

| Type | Tool | Coverage Target | When |
|------|------|-----------------|------|
| **Unit** | Vitest + React Testing Library | 70% | Pre-commit |
| **Integration** | Vitest + MSW | 60% | Pre-push |
| **E2E** | Playwright | Critical paths | CI/CD |
| **Visual** | Storybook + Chromatic | Components | CI/CD |

```typescript
// tests/unit/staff-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { StaffForm } from '@/features/staff/components/staff-form'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('StaffForm', () => {
  it('validates required fields', async () => {
    renderWithProviders(<StaffForm />)
    
    const submitButton = screen.getByRole('button', { name: /create staff/i })
    fireEvent.click(submitButton)
    
    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  })
  
  it('submits form with valid data', async () => {
    renderWithProviders(<StaffForm />)
    
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@company.com' },
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create staff/i }))
    
    // Assert API call or success state
  })
})
```

---

## 17. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Next.js 14+ project setup with App Router
- [ ] TypeScript configuration with strict mode
- [ ] Tailwind CSS + shadcn/ui initialization
- [ ] ESLint + Prettier configuration
- [ ] TanStack Query setup with SSR hydration
- [ ] Zustand store architecture
- [ ] API client with interceptors
- [ ] Authentication pages (login, register, forgot password)
- [ ] Dashboard layout with sidebar and header
- [ ] Theme system (light/dark mode)
- [ ] Command palette (CMD+K)

### Phase 2: Core UI Components (Weeks 3-4)
- [ ] Data table component with sorting, filtering, pagination
- [ ] Form system with validation
- [ ] Modal/Drawer system
- [ ] Toast notification system
- [ ] File upload component
- [ ] Rich text editor (for announcements)
- [ ] Date range picker
- [ ] Multi-select component
- [ ] Search and filter patterns
- [ ] Loading states and skeletons

### Phase 3: Staff Module (Weeks 5-6)
- [ ] Staff list page with data table
- [ ] Staff detail page
- [ ] Staff create/edit forms
- [ ] Department management
- [ ] Attendance tracking view
- [ ] Leave request form and list
- [ ] Org chart visualization
- [ ] Document upload/view

### Phase 4: Project Module (Weeks 7-9)
- [ ] Project list and detail pages
- [ ] Task management (CRUD)
- [ ] Sprint planning interface
- [ ] Time tracking widget
- [ ] **Kanban board with drag-and-drop**
- [ ] Gantt chart view
- [ ] Milestone tracking
- [ ] Project dashboard with metrics

### Phase 5: Pipeline & Clients (Weeks 10-11)
- [ ] Customizable pipeline boards
- [ ] Workflow automation rules UI
- [ ] Client management pages
- [ ] Contract management
- [ ] Support ticket system
- [ ] Proposal builder

### Phase 6: Payroll & Financial (Weeks 12-13)
- [ ] Payroll generation interface
- [ ] Payslip viewer and download
- [ ] Salary structure management
- [ ] Expense claim forms
- [ ] Budget tracking dashboards
- [ ] Financial reports with charts

### Phase 7: Communication (Weeks 14-16)
- [ ] Real-time chat interface
- [ ] Chat rooms (1:1 and group)
- [ ] Project-specific chat
- [ ] Message threading
- [ ] File sharing in chat
- [ ] Emoji reactions
- [ ] Typing indicators
- [ ] Announcement creation and display
- [ ] Notification center
- [ ] @mentions system

### Phase 8: Culture & Events (Weeks 17-18)
- [ ] Events listing and calendar
- [ ] Trip planning interface
- [ ] Registration forms
- [ ] Photo gallery
- [ ] Employee recognition system
- [ ] Polls and voting
- [ ] Leaderboard

### Phase 9: Admin & Polish (Weeks 19-20)
- [ ] Audit log viewer
- [ ] Role and permission management
- [ ] User impersonation (admin)
- [ ] System settings
- [ ] Advanced search (Elasticsearch)
- [ ] Analytics dashboards
- [ ] Export functionality (CSV, Excel, PDF)
- [ ] Print-friendly views

### Phase 10: Performance & Scale (Weeks 21-22)
- [ ] Virtual scrolling for large lists
- [ ] Image optimization
- [ ] Code splitting and lazy loading
- [ ] Service worker for offline support
- [ ] Bundle optimization
- [ ] Core Web Vitals optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness review

### Phase 11: Production Deployment (Week 23)
- [ ] Cloudflare Workers deployment setup
- [ ] Environment configuration
- [ ] DNS and SSL setup
- [ ] CDN configuration
- [ ] Monitoring and analytics
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Backup and disaster recovery
- [ ] Documentation and handover

---

## Appendix

### A. Route Structure

| Route | Module | Access | Description |
|-------|--------|--------|-------------|
| `/login` | Auth | Public | Login page |
| `/register` | Auth | Public | Registration |
| `/dashboard` | Dashboard | Authenticated | Home dashboard |
| `/staff` | Staff | `staff:read` | Staff list |
| `/staff/[id]` | Staff | `staff:read` | Staff detail |
| `/staff/[id]/edit` | Staff | `staff:write` | Edit staff |
| `/projects` | Projects | `project:read` | Project list |
| `/projects/[id]` | Projects | `project:read` | Project detail |
| `/projects/[id]/tasks` | Projects | `project:read` | Project tasks |
| `/pipeline` | Pipeline | `project:read` | Kanban boards |
| `/clients` | Clients | `client:read` | Client list |
| `/payroll` | Payroll | `payroll:read` | Payroll cycles |
| `/payroll/my-payslips` | Payroll | Authenticated | My payslips |
| `/chat` | Chat | Authenticated | Chat home |
| `/chat/[roomId]` | Chat | Authenticated | Chat room |
| `/announcements` | Announcements | Authenticated | Announcements |
| `/events` | Events | Authenticated | Events list |
| `/audit` | Audit | `audit:read` | Audit logs |
| `/settings` | Settings | Authenticated | User settings |

### B. Permission Matrix (UI)

| Feature | View | Create | Edit | Delete | Admin |
|---------|------|--------|------|--------|-------|
| **Staff** | `staff:read` | `staff:write` | `staff:write` | `staff:delete` | `staff:admin` |
| **Projects** | `project:read` | `project:write` | `project:write` | `project:delete` | `project:admin` |
| **Payroll** | `payroll:read` | `payroll:write` | `payroll:write` | - | `payroll:admin` |
| **Clients** | `client:read` | `client:write` | `client:write` | `client:delete` | `client:admin` |
| **Announcements** | - | `announcement:write` | `announcement:write` | `announcement:delete` | - |
| **Audit** | `audit:read` | - | - | - | `audit:admin` |

### C. Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### D. Key Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Time to Interactive (TTI)** | < 3.5s | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **First Input Delay (FID)** | < 100ms | Lighthouse |
| **Total Blocking Time (TBT)** | < 200ms | Lighthouse |
| **Bundle Size (initial)** | < 200KB | webpack-bundle-analyzer |
| **API Response Time** | < 200ms | TanStack Query devtools |

---

**Document Version**: 1.0  
**Last Updated**: April 2026  
**Author**: Frontend Architecture Team  
**Review Cycle**: Quarterly