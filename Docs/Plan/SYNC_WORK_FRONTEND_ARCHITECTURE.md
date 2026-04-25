# SyncWork Frontend Architecture

## Executive Summary

This document presents a comprehensive, industry-standard frontend architecture for the SyncWork Office Management System. Built on Next.js 15+ with the App Router, this architecture delivers a modern, type-safe, performant, and accessible user interface with rich micro-interactions and animations. The design follows clean architecture principles with clear separation of concerns, modular feature organization, robust state management, and SOLID/DRY compliance.

**Architecture Pattern**: Modular Feature-Based Architecture with Clean Architecture principles
**Rendering Strategy**: Hybrid (Server Components default, Client Components for interactivity)
**State Management**: Server State (TanStack Query) + Client State (Zustand)
**Styling Strategy**: Tailwind CSS + shadcn/ui components + CSS variables for theming
**Animation Strategy**: Framer Motion (React animations) + GSAP (complex sequences)
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
13. [Micro-Interactions & Animations](#13-micro-interactions--animations)
14. [Performance Strategy](#14-performance-strategy)
15. [Error Handling](#15-error-handling)
16. [SOLID & DRY Principles](#16-solid--dry-principles)
17. [Deployment Architecture](#17-deployment-architecture)
18. [Development Workflow](#18-development-workflow)
19. [Implementation Roadmap](#19-implementation-roadmap)

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
| **SOLID Compliance** | Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion |
| **DRY Enforcement** | Reusable components, shared hooks, centralized utilities |
| **Animation Excellence** | Meaningful micro-interactions, 60fps animations, reduced motion support |

### 1.2 Architectural Decision Records

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 15+ App Router | Server Components, nested layouts, streaming, edge-ready, React 19 |
| **Components** | shadcn/ui | Headless, accessible, customizable, built on Radix UI |
| **State (Server)** | TanStack Query | Caching, background updates, optimistic updates, devtools |
| **State (Client)** | Zustand | Lightweight, TypeScript-friendly, no boilerplate |
| **Forms** | React Hook Form + Zod | Performance, validation, type safety |
| **Styling** | Tailwind CSS | Utility-first, minimal CSS bundle, design system friendly |
| **Animations** | Framer Motion + GSAP | Declarative React animations + complex timeline sequences |
| **Deployment** | Cloudflare Workers | Edge runtime, global CDN, DDoS protection, cost-effective |
| **Icons** | Lucide React | Tree-shakeable, consistent, accessible |

### 1.3 SOLID Principles Mapping

| Principle | Frontend Implementation |
|-----------|------------------------|
| **Single Responsibility** | Each component does one thing; hooks separate logic from UI |
| **Open/Closed** | Extend components via composition, not modification |
| **Liskov Substitution** | Base components accept any child; polymorphic components |
| **Interface Segregation** | Small, focused props interfaces; no god objects |
| **Dependency Inversion** | Depend on abstractions (interfaces, hooks), not concrete implementations |

---

## 2. Technology Stack

### 2.1 Core Dependencies

```json
{
  "dependencies": {
    "next": "^16.2.0",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
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
    
    "framer-motion": "^11.0.0",
    "gsap": "^3.12.0",
    "@gsap/react": "^2.1.0",
    
    "next-themes": "^0.3.0",
    "sonner": "^1.4.0",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "react-day-picker": "^8.10.0",
    
    "@hello-pangea/dnd": "^16.6.0",
    "recharts": "^2.12.0",
    "lucide-react": "^0.400.0",
    
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

### 2.3 Animation Libraries

| Library | Purpose | Use Cases |
|---------|---------|-----------|
| **Framer Motion** | React animations | Page transitions, layout animations, gestures, AnimatePresence |
| **GSAP** | Complex timelines | Hero animations, scroll-triggered sequences, complex orchestration |
| **@gsap/react** | GSAP React integration | useGSAP hook, proper cleanup |

### 2.4 Additional Recommended Libraries

| Library | Purpose | Justification |
|---------|---------|---------------|
| **@hello-pangea/dnd** | Drag-and-drop | Modern replacement for react-beautiful-dnd, Kanban boards |
| **recharts** | Data visualization | Charts for dashboards, payroll, project metrics |
| **sonner** | Toast notifications | Better API than react-hot-toast, beautiful UI |
| **cmdk** | Command palette | Spotlight-style search, keyboard navigation |
| **date-fns** | Date manipulation | Tree-shakeable, immutable, better than moment.js |
| **react-day-picker** | Date pickers | Accessible, customizable, works with date-fns |
| **usehooks-ts** | Utility hooks | battle-tested hooks (useDebounce, useLocalStorage, etc.) |

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
│                                                    ├─ Framer Motion
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
│                         ANIMATION LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Framer Motion (layout, gestures, AnimatePresence)               │  │
│  │  GSAP (complex timelines, scroll triggers)                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
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
│   │   ├── finance/                  # Finance Module (Payroll, Expenses, Budgets)
│   │   │   ├── payroll/
│   │   │   ├── expenses/
│   │   │   └── budgets/
│   │   │
│   │   ├── communication/            # Communication Module
│   │   │   ├── chat/
│   │   │   ├── announcements/
│   │   │   └── notifications/
│   │   │
│   │   ├── culture/                  # Culture & Events Module
│   │   │   ├── events/
│   │   │   ├── polls/
│   │   │   └── recognitions/
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
│   ├── animations/                  # Animation components
│   │   ├── page-transition.tsx
│   │   ├── fade-in.tsx
│   │   ├── stagger-container.tsx
│   │   ├── slide-up.tsx
│   │   ├── scale-in.tsx
│   │   └── skeleton.tsx
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
│   ├── animations/                  # Animation utilities
│   │   ├── variants.ts              # Framer Motion variants
│   │   ├── transitions.ts           # Page transitions
│   │   └── easings.ts               # Custom easing functions
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
│   ├── finance/
│   ├── clients/
│   ├── pipeline/
│   ├── announcements/
│   ├── culture/
│   └── audit/
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

import { motion } from 'framer-motion'
import { useStaffList } from '../hooks/use-staff-list'
import { DataTable } from '@/components/data-table'
import { columns } from './columns'
import { containerVariants, itemVariants } from '@/lib/animations/variants'

export function StaffTable({ filters }: { filters: StaffFilters }) {
  const { data, isLoading, error } = useStaffList(filters)
  
  if (isLoading) return <DataTable.Skeleton />
  if (error) return <DataTable.Error error={error} />
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <DataTable 
        data={data?.items ?? []} 
        columns={columns}
        pagination={data?.pagination}
        rowAnimation={itemVariants}
      />
    </motion.div>
  )
}
```

#### Project Pipeline Module (Kanban)

```typescript
// features/pipeline/components/board.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
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
      <motion.div 
        className="flex gap-4 overflow-x-auto pb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <AnimatePresence>
          {data?.stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: index * 0.1 }}
            >
              <Droppable droppableId={stage.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <PipelineColumn stage={stage} />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
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
import { motion } from 'framer-motion'

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
      <motion.div 
        className="rounded-md border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
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
      {data.map((row, index) => (
        <motion.tr
          key={row.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {columns.map((column) => (
            <Table.Cell key={column.id}>
              {column.cell(row)}
            </Table.Cell>
          ))}
        </motion.tr>
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
    <motion.div 
      className="flex items-center justify-between"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
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
Cache Invalidation + Toast + Animation
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
import { motion } from 'framer-motion'
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
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
          
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-4 w-4" />
              </motion.div>
            ) : (
              'Create Staff'
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
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
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.2s ease-in',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

---

## 13. Micro-Interactions & Animations

### 13.1 Animation Philosophy

- **Purposeful**: Every animation serves a functional purpose (feedback, guidance, delight)
- **Performant**: 60fps using transform and opacity only; avoid layout-triggering properties
- **Accessible**: Respect `prefers-reduced-motion`; provide instant fallbacks
- **Consistent**: Unified easing curves and duration scales across the application

### 13.2 Animation Tokens

```typescript
// lib/animations/variants.ts
import { Variants } from 'framer-motion'

// Easing curves
export const easings = {
  smooth: [0.4, 0, 0.2, 1],      // Standard ease
  enter: [0, 0, 0.2, 1],         // Decelerate (entrances)
  exit: [0.4, 0, 1, 1],          // Accelerate (exits)
  bounce: [0.68, -0.55, 0.265, 1.55], // Playful bounce
}

// Duration scale (seconds)
export const durations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
}

// Standard fade in
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: durations.normal, ease: easings.smooth }
  },
}

// Slide up fade in
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: durations.normal, ease: easings.enter }
  },
}

// Scale in
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: durations.fast, ease: easings.smooth }
  },
}

// Stagger container
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

// Stagger item
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.enter },
  },
}

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: durations.slow, ease: easings.enter }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: durations.fast, ease: easings.exit }
  },
}

// Card hover
export const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: { 
    scale: 1.02, 
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    transition: { duration: durations.fast, ease: easings.smooth }
  },
}

// Button tap
export const buttonTap = {
  tap: { scale: 0.97 },
}
```

### 13.3 Page Transitions

```typescript
// components/animations/page-transition.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { pageTransition } from '@/lib/animations/variants'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### 13.4 Stagger Lists

```typescript
// components/animations/stagger-list.tsx
'use client'

import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/animations/variants'

interface StaggerListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
}

export function StaggerList<T>({ items, renderItem, className }: StaggerListProps<T>) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {items.map((item, index) => (
        <motion.div key={index} variants={itemVariants}>
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  )
}
```

### 13.5 Skeleton Loading States

```typescript
// components/animations/skeleton.tsx
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn('animate-pulse bg-muted rounded', className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}
    </>
  )
}

// Shimmer effect
export function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}
```

### 13.6 Hover & Active States

```typescript
// components/animations/animated-card.tsx
'use client'

import { motion } from 'framer-motion'
import { cardHover } from '@/lib/animations/variants'

export function AnimatedCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="rest"
      whileHover="hover"
      variants={cardHover}
    >
      {children}
    </motion.div>
  )
}

// Animated button with tap feedback
export function AnimatedButton({ children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
```

### 13.7 Number Counter Animation

```typescript
// components/animations/counter.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface CounterProps {
  value: number
  duration?: number
  className?: string
}

export function Counter({ value, duration = 2, className }: CounterProps) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (current) => Math.round(current))
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    spring.set(value)
  }, [spring, value])
  
  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest)
    })
    return unsubscribe
  }, [display])
  
  return <span className={className}>{displayValue}</span>
}
```

### 13.8 GSAP Complex Sequences

```typescript
// components/animations/hero-section.tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    
    tl.from('.hero-title', {
      y: 100,
      opacity: 0,
      duration: 1,
    })
    .from('.hero-subtitle', {
      y: 50,
      opacity: 0,
      duration: 0.8,
    }, '-=0.5')
    .from('.hero-cta', {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
    }, '-=0.3')
    .from('.hero-image', {
      x: 100,
      opacity: 0,
      duration: 1,
    }, '-=0.8')
  }, { scope: containerRef })
  
  return (
    <div ref={containerRef} className="hero-section">
      <h1 className="hero-title">Welcome to SyncWork</h1>
      <p className="hero-subtitle">Manage your office with ease</p>
      <button className="hero-cta">Get Started</button>
      <img className="hero-image" src="/hero.png" alt="Hero" />
    </div>
  )
}
```

### 13.9 Reduced Motion Support

```typescript
// lib/animations/use-reduced-motion.ts
import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return prefersReducedMotion
}

// Usage in components
export function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      Content
    </motion.div>
  )
}
```

---

## 14. Performance Strategy

### 14.1 Optimization Techniques

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
| **Animation Optimization** | transform/opacity only, will-change | 60fps animations |
| **Lazy Loading Animations** | Dynamic import Framer Motion | Reduce initial bundle |

### 14.2 Bundle Analysis

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

### 14.3 Animation Performance

```typescript
// lib/animations/performance.ts
import { Variants } from 'framer-motion'

// GPU-accelerated properties only
export const gpuOptimized: Variants = {
  hidden: { opacity: 0, transform: 'translateY(20px)' },
  visible: { 
    opacity: 1, 
    transform: 'translateY(0)',
    transition: { 
      duration: 0.3,
      // Use will-change sparingly
      willChange: 'transform, opacity'
    }
  },
}

// Layout animation with layoutId
export function LayoutAnimation({ children, layoutId }: { children: React.ReactNode; layoutId: string }) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}
```

---

## 15. Error Handling

### 15.1 Error Boundaries with Animation

```typescript
// components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    return (
      <AnimatePresence>
        {this.state.hasError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center min-h-screen p-4"
          >
            <motion.h1 
              className="text-2xl font-bold text-red-600 mb-4"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
            >
              Something went wrong
            </motion.h1>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </motion.button>
          </motion.div>
        ) : (
          this.props.children
        )}
      </AnimatePresence>
    )
  }
}
```

---

## 16. SOLID & DRY Principles

### 16.1 Single Responsibility

```typescript
// BAD: Component does too much
function UserCard({ user }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(user)
  const { mutate } = useUpdateUser()
  const router = useRouter()
  
  // ... lots of logic mixed with UI
}

// GOOD: Separate concerns
function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <UserAvatar user={user} />
      <UserInfo user={user} />
      <UserActions userId={user.id} />
    </Card>
  )
}

// Hook handles data logic
function useUserActions(userId: string) {
  const { mutate: updateUser } = useUpdateUser()
  const { mutate: deleteUser } = useDeleteUser()
  const router = useRouter()
  
  return {
    onEdit: () => router.push(`/users/${userId}/edit`),
    onDelete: () => deleteUser(userId),
    onUpdate: (data: Partial<User>) => updateUser({ id: userId, data }),
  }
}
```

### 16.2 Open/Closed Principle

```typescript
// Base component is closed for modification
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

// Extended via composition, not modification
function IconButton({ icon, ...props }: ButtonProps & { icon: React.ReactNode }) {
  return (
    <Button {...props}>
      <span className="mr-2">{icon}</span>
      {props.children}
    </Button>
  )
}

// Polymorphic component
interface PolymorphicProps<T extends React.ElementType> {
  as?: T
}

function Container<T extends React.ElementType = 'div'>({
  as,
  ...props
}: PolymorphicProps<T> & React.ComponentPropsWithoutRef<T>) {
  const Component = as || 'div'
  return <Component {...props} />
}
```

### 16.3 Interface Segregation

```typescript
// BAD: God interface
interface UserProps {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  department: string
  manager: string
  salary: number
  // ... 20 more fields
}

// GOOD: Segregated interfaces
interface UserIdentity {
  id: string
  name: string
  email: string
  avatar: string
}

interface UserRole {
  role: string
  department: string
  manager: string
}

interface UserCompensation {
  salary: number
  currency: string
}

// Compose only what's needed
function UserCard({ user }: { user: UserIdentity }) {
  // Only needs identity info
}

function UserProfile({ user }: { user: UserIdentity & UserRole }) {
  // Needs identity + role
}
```

### 16.4 Dependency Inversion

```typescript
// Abstract hook interface
interface UseDataOptions<T> {
  queryKey: string[]
  queryFn: () => Promise<T>
  enabled?: boolean
}

// Concrete implementation depends on abstraction
function useData<T>({ queryKey, queryFn, enabled = true }: UseDataOptions<T>) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
  })
}

// Usage - depends on abstraction, not concrete implementation
function StaffList() {
  const { data, isLoading } = useData<Staff[]>({
    queryKey: ['staff'],
    queryFn: () => api.get('/staff').then(r => r.data),
  })
  
  // ...
}
```

### 16.5 DRY Enforcement

```typescript
// Shared animation wrapper
function withAnimation<T extends object>(
  Component: React.ComponentType<T>,
  animation: Variants
) {
  return function AnimatedComponent(props: T) {
    return (
      <motion.div
        variants={animation}
        initial="hidden"
        animate="visible"
      >
        <Component {...props} />
      </motion.div>
    )
  }
}

// Reusable data fetching hook factory
function createUseList<T>(endpoint: string, queryKey: string) {
  return function useList(filters?: Record<string, any>) {
    return useQuery({
      queryKey: [queryKey, filters],
      queryFn: () => api.get(endpoint, { params: filters }).then(r => r.data),
    })
  }
}

// Usage
const useStaffList = createUseList<Staff[]>('/staff', 'staff')
const useProjectList = createUseList<Project[]>('/projects', 'projects')
```

---

## 17. Deployment Architecture

### 17.1 Cloudflare Workers Configuration

```toml
# wrangler.toml
name = "syncwork-frontend"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"

[site]
bucket = ".next"
```

### 17.2 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME=SyncWork
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/ws
```

---

## 18. Development Workflow

### 18.1 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/asthrix/syncwork-frontend.git
cd syncwork-frontend

# 2. Install dependencies
npm install

# 3. Setup shadcn/ui
npx shadcn-ui@latest init

# 4. Add required components
npx shadcn-ui@latest add button card dialog form input label select table tabs toast

# 5. Run development server
npm run dev
```

### 18.2 Code Generation

```bash
# Generate new feature module
npm run generate:feature --name=staff

# Generate API types from OpenAPI
npm run generate:types

# Generate component
npm run generate:component --name=UserCard --path=components/ui
```

---

## 19. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Project setup with Next.js 15 + TypeScript
- [ ] Tailwind CSS + shadcn/ui configuration
- [ ] TanStack Query + Zustand setup
- [ ] API client with interceptors
- [ ] Authentication flow (login/register)
- [ ] Layout components (sidebar, header)
- [ ] Basic routing structure

### Phase 2: Core Features (Week 2-3)
- [ ] Dashboard with stats cards
- [ ] Staff management (CRUD)
- [ ] Project management (CRUD)
- [ ] Client management (CRUD)
- [ ] Data tables with sorting/filtering

### Phase 3: Advanced Features (Week 4-5)
- [ ] Kanban board with drag-and-drop
- [ ] Chat with WebSocket
- [ ] Notifications system
- [ ] File uploads
- [ ] Search with command palette

### Phase 4: Polish (Week 6)
- [ ] Micro-interactions & animations
- [ ] Dark mode
- [ ] Responsive design
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Testing (unit + e2e)

### Phase 5: Deployment (Week 7)
- [ ] Cloudflare Workers setup
- [ ] CI/CD pipeline
- [ ] Monitoring & analytics
- [ ] Documentation

---

## Backend API Compatibility

### API Endpoints Summary

#### Authentication & User Management
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/password-reset
POST   /api/v1/auth/password-reset/confirm

GET    /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
PUT    /api/v1/users/:id/password
POST   /api/v1/users/:user_id/roles
DELETE /api/v1/users/:user_id/roles/:role_id
```

#### RBAC
```
GET    /api/v1/roles
POST   /api/v1/roles
GET    /api/v1/roles/:id
PUT    /api/v1/roles/:id
DELETE /api/v1/roles/:id

GET    /api/v1/permissions
POST   /api/v1/permissions
```

#### Staff & HR
```
GET    /api/v1/staff
POST   /api/v1/staff
GET    /api/v1/staff/:id
PUT    /api/v1/staff/:id
DELETE /api/v1/staff/:id
GET    /api/v1/staff/search
GET    /api/v1/staff/org-chart

GET    /api/v1/departments
POST   /api/v1/departments
GET    /api/v1/departments/:id
GET    /api/v1/departments/:id/staff

POST   /api/v1/attendance/check-in
POST   /api/v1/attendance/check-out
GET    /api/v1/attendance/my

GET    /api/v1/leaves
POST   /api/v1/leaves
PUT    /api/v1/leaves/:id/approve
PUT    /api/v1/leaves/:id/reject

GET    /api/v1/performance-reviews
POST   /api/v1/performance-reviews
```

#### Project Management
```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
GET    /api/v1/projects/:id/members
POST   /api/v1/projects/:id/members
GET    /api/v1/projects/:id/tasks
GET    /api/v1/projects/:id/sprints
GET    /api/v1/projects/:id/milestones

GET    /api/v1/tasks/:id
PUT    /api/v1/tasks/:id
POST   /api/v1/tasks/:id/assign
POST   /api/v1/tasks/:id/status

GET    /api/v1/sprints/:id
POST   /api/v1/sprints/:id/start
POST   /api/v1/sprints/:id/complete

GET    /api/v1/pipelines
POST   /api/v1/pipelines
GET    /api/v1/pipelines/:id/stages
POST   /api/v1/pipelines/:id/move-task
```

#### Client & Financial
```
GET    /api/v1/clients
POST   /api/v1/clients
GET    /api/v1/clients/:id
GET    /api/v1/clients/:id/contacts
GET    /api/v1/clients/:id/contracts

GET    /api/v1/contracts
POST   /api/v1/contracts
POST   /api/v1/contracts/:id/renew
POST   /api/v1/contracts/:id/terminate

GET    /api/v1/tickets
POST   /api/v1/tickets
POST   /api/v1/tickets/:id/assign
POST   /api/v1/tickets/:id/resolve

GET    /api/v1/payroll
POST   /api/v1/payroll/generate
GET    /api/v1/payroll/my

GET    /api/v1/expenses
POST   /api/v1/expenses
POST   /api/v1/expenses/:id/approve

GET    /api/v1/budgets
POST   /api/v1/budgets
GET    /api/v1/budgets/:id/transactions
```

#### Communication
```
GET    /api/v1/chat/rooms
POST   /api/v1/chat/rooms
GET    /api/v1/chat/rooms/:id/messages
POST   /api/v1/chat/rooms/:id/messages

GET    /api/v1/announcements
POST   /api/v1/announcements
POST   /api/v1/announcements/:id/acknowledge

GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
PUT    /api/v1/notifications/read-all

GET    /ws                        # WebSocket endpoint
```

#### Culture
```
GET    /api/v1/culture/events
POST   /api/v1/culture/events
POST   /api/v1/culture/events/:id/register

GET    /api/v1/culture/trips
POST   /api/v1/culture/trips

GET    /api/v1/culture/polls
POST   /api/v1/culture/polls
POST   /api/v1/culture/polls/:id/vote

GET    /api/v1/culture/recognitions
POST   /api/v1/culture/recognitions
GET    /api/v1/culture/leaderboard
```

#### Audit & Compliance
```
GET    /api/v1/audit-logs
GET    /api/v1/audit-logs/search
GET    /api/v1/audit-logs/stats

GET    /api/v1/compliance/gdpr/export
POST   /api/v1/compliance/gdpr/delete-request
GET    /api/v1/compliance/retention-policies
```

---

## Conclusion

This architecture provides:
- **Modern UX**: Rich micro-interactions and animations with Framer Motion + GSAP
- **Performance**: Server Components, code splitting, virtual scrolling, optimized animations
- **Maintainability**: SOLID/DRY principles, feature-based organization, type safety
- **Accessibility**: WCAG 2.1 AA, keyboard navigation, reduced motion support
- **Scalability**: Modular architecture, clear boundaries, edge deployment
- **Backend Compatibility**: Direct mapping to all 200+ API endpoints

**Total Estimated Lines**: ~15,000+ Go backend + ~5,000+ TypeScript frontend
**API Endpoints**: 200+ across 10 domains
**Deployment**: Production-ready with Docker Compose
