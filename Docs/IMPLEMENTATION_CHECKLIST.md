# SyncWork Frontend - Implementation Checklist & Verification Plan

> **Document Purpose**: This file serves as the master checklist for building the SyncWork Office Management System frontend. Use this to track progress, verify completion, and ensure all features are implemented according to the architecture specifications.
>
> **Last Updated**: 2025-01-25
> **Target Environment**: Production with Docker Compose / Kubernetes
> **Architecture**: Modular Feature-Based with Clean Architecture + BFF Pattern
> **Security Level**: Enterprise (JWT + httpOnly cookies, CSRF, XSS protection)

---

## Legend

- [ ] Not Started
- [ ] In Progress
- [x] Completed
- [ ] Blocked

---

## Phase 0: Project Setup & Dependencies

### 0.1 Core Dependencies Installation
- [ ] Install Next.js 16.2+ (already present)
- [ ] Install React 19.1+
- [ ] Install TypeScript 5.7+
- [ ] Install Tailwind CSS 4.0+
- [ ] Install shadcn/ui CLI and components

### 0.2 State Management & Data Fetching
- [ ] Install `zustand` (state management)
- [ ] Install `@tanstack/react-query` (server state)
- [ ] Install `@tanstack/react-query-devtools` (debugging)

### 0.3 Animation Libraries
- [ ] Install `framer-motion` (React animations)
- [ ] Install `gsap` (complex timelines)
- [ ] Install `@gsap/react` (GSAP React integration)

### 0.4 Forms & Validation
- [ ] Install `react-hook-form` (form handling)
- [ ] Install `@hookform/resolvers` (validation bridge)
- [ ] Install `zod` (schema validation)

### 0.5 UI Utilities
- [ ] Install `sonner` (toast notifications)
- [ ] Install `cmdk` (command palette)
- [ ] Install `date-fns` (date manipulation)
- [ ] Install `react-day-picker` (date pickers)
- [ ] Install `next-themes` (theme management)

### 0.6 Additional Features
- [ ] Install `recharts` (data visualization)
- [ ] Install `@hello-pangea/dnd` (drag & drop)
- [ ] Install `axios` (HTTP client)
- [ ] Install `lucide-react` (icons)

### 0.7 shadcn/ui Components
- [ ] Add `button` component
- [ ] Add `card` component
- [ ] Add `dialog` component
- [ ] Add `form` component
- [ ] Add `input` component
- [ ] Add `label` component
- [ ] Add `select` component
- [ ] Add `table` component
- [ ] Add `tabs` component
- [ ] Add `toast` component
- [ ] Add `avatar` component
- [ ] Add `scroll-area` component
- [ ] Add `skeleton` component
- [ ] Add `sheet` component
- [ ] Add `calendar` component
- [ ] Add `popover` component
- [ ] Add `command` component
- [ ] Add `progress` component
- [ ] Add `textarea` component
- [ ] Add `separator` component
- [ ] Add `dropdown-menu` component
- [ ] Add `badge` component
- [ ] Add `switch` component
- [ ] Add `checkbox` component
- [ ] Add `radio-group` component
- [ ] Add `slider` component
- [ ] Add `alert-dialog` component
- [ ] Add `tooltip` component
- [ ] Add `accordion` component
- [ ] Add `breadcrumb` component
- [ ] Add `collapsible` component
- [ ] Add `context-menu` component
- [ ] Add `hover-card` component
- [ ] Add `menubar` component
- [ ] Add `navigation-menu` component
- [ ] Add `pagination` component
- [ ] Add `resizable` component
- [ ] Add `sonner` component
- [ ] Add `toggle` component
- [ ] Add `toggle-group` component

### 0.8 Project Configuration
- [ ] Create `.env.local` file
- [ ] Create `.env.production` file
- [ ] Create `.env.staging` file
- [ ] Update `next.config.ts` with headers, rewrites, CSP
- [ ] Configure TypeScript strict mode
- [ ] Setup ESLint + Prettier configuration
- [ ] Setup path aliases (`@/*`)
- [ ] Configure Tailwind theme extensions

### 0.9 Environment Variables
```bash
# Development
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_API_URL=https://api.syncwork.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.syncwork.com/ws
NEXT_PUBLIC_APP_URL=https://app.syncwork.com
```

---

## Phase 1: Core Infrastructure (Foundation)

### 1.1 API Layer
- [ ] Create `src/lib/api/client.ts` - Axios instance with interceptors
- [ ] Create `src/lib/api/endpoints.ts` - API endpoint definitions
- [ ] Create `src/lib/config/env.ts` - Environment configuration
- [ ] Setup request interceptor (X-Request-ID, auth headers)
- [ ] Setup response interceptor (error handling, 401 redirect)
- [ ] Configure request timeout (30s)
- [ ] Add `withCredentials: true` for httpOnly cookies

### 1.2 Backend-For-Frontend (BFF) Auth Routes
- [ ] Create `src/app/api/auth/login/route.ts` - Login with httpOnly cookies
- [ ] Create `src/app/api/auth/register/route.ts` - Registration
- [ ] Create `src/app/api/auth/refresh/route.ts` - Token refresh
- [ ] Create `src/app/api/auth/logout/route.ts` - Logout & clear cookies
- [ ] Create `src/app/api/auth/me/route.ts` - Current user
- [ ] Create `src/app/api/auth/token/route.ts` - Get WS token
- [ ] Setup httpOnly cookie flags (Secure, SameSite=Strict, Path=/)
- [ ] Configure refresh token Max-Age (7 days)
- [ ] Configure access token Max-Age (15 minutes)

### 1.3 TanStack Query Setup
- [ ] Create `src/lib/query-client.ts` - QueryClient configuration
- [ ] Configure staleTime (60s)
- [ ] Configure gcTime (5min)
- [ ] Configure retry logic (exponential backoff)
- [ ] Configure global error handler
- [ ] Create `src/providers/query-provider.tsx`
- [ ] Setup ReactQueryDevtools

### 1.4 Query Keys Convention
- [ ] Create `src/lib/query-keys.ts`
- [ ] Define auth keys (`['me']`)
- [ ] Define users keys (`['users']`, `['users', id]`)
- [ ] Define staff keys (`['employees']`, `['departments']`, etc.)
- [ ] Define project keys (`['projects']`, `['tasks']`, etc.)
- [ ] Define client keys (`['clients']`, `['expenses']`)
- [ ] Define communication keys (`['rooms']`, `['messages']`)
- [ ] Define culture keys (`['events']`, `['polls']`)

### 1.5 Zustand Stores
- [ ] Create `src/lib/stores/auth-store.ts`
  - [ ] User state
  - [ ] Access token (memory only)
  - [ ] Authentication status
  - [ ] Login/logout actions
  - [ ] Permission checking
  - [ ] Persist to localStorage (user only)
- [ ] Create `src/lib/stores/ui-store.ts`
  - [ ] Sidebar open/collapsed state
  - [ ] Theme preference (light/dark/system)
  - [ ] Command menu state
  - [ ] Notifications panel state
- [ ] Create `src/lib/stores/notification-store.ts`
  - [ ] Toast queue
  - [ ] Auto-dismiss timer
  - [ ] Max visible limit (5)

### 1.6 Theme System
- [ ] Create `src/providers/theme-provider.tsx`
- [ ] Wrap `next-themes`
- [ ] Handle system preference detection
- [ ] Configure smooth transitions (300ms)
- [ ] Create `src/components/theme-toggle.tsx`
  - [ ] Sun/Moon icon animation
  - [ ] GSAP rotation on toggle
  - [ ] Dropdown (Light/Dark/System)

### 1.7 Animation Utilities
- [ ] Create `src/lib/animations/variants.ts`
  - [ ] `fadeIn` variant
  - [ ] `slideUp` variant
  - [ ] `slideInLeft` variant
  - [ ] `scaleIn` variant
  - [ ] `staggerContainer` variant
  - [ ] `pageTransition` variant
  - [ ] `itemVariants` for lists
- [ ] Create `src/lib/animations/gsap.ts`
  - [ ] Timeline presets
  - [ ] ScrollTrigger setup
  - [ ] Page entrance orchestration
  - [ ] CountUp animation utility
  - [ ] Dashboard entrance timeline

### 1.8 Utility Functions
- [ ] Create `src/lib/utils.ts` (already exists - cn helper)
- [ ] Create `src/lib/utils/format.ts`
  - [ ] Date formatting
  - [ ] Currency formatting
  - [ ] Number formatting
  - [ ] Relative time (e.g., "2 hours ago")
- [ ] Create `src/lib/utils/permissions.ts`
  - [ ] Role checking helpers
  - [ ] Permission validation
- [ ] Create `src/lib/utils/export.ts`
  - [ ] CSV export
  - [ ] Excel export
  - [ ] PDF export

---

## Phase 2: Layout Shell

### 2.1 Root Layout
- [ ] Update `src/app/layout.tsx`
  - [ ] Add `suppressHydrationWarning`
  - [ ] Wrap with ThemeProvider
  - [ ] Wrap with QueryProvider
  - [ ] Wrap with AuthProvider
  - [ ] Wrap with WebSocketProvider
  - [ ] Add SonnerToaster
  - [ ] Configure fonts (Manrope, Geist)
  - [ ] Add metadata (title, description)

### 2.2 Dashboard Layout
- [ ] Create `src/app/(dashboard)/layout.tsx`
  - [ ] Sidebar component
  - [ ] TopBar component
  - [ ] Main content area with padding
  - [ ] Breadcrumb auto-generation
  - [ ] AnimatePresence for page transitions

### 2.3 Sidebar Component
- [ ] Create `src/components/layout/sidebar.tsx`
  - [ ] Logo area with SyncWork branding
  - [ ] Navigation items with Lucide icons
  - [ ] Active state styling
  - [ ] Hover animations (translateX)
  - [ ] Collapse/expand button
  - [ ] Collapsed state (icon only)
  - [ ] Mobile sheet/drawer overlay
  - [ ] Staggered entrance animation
  - [ ] Scroll area for long menus
  - [ ] User profile section at bottom

### 2.4 Sidebar Navigation Items
- [ ] Dashboard (LayoutDashboard icon)
- [ ] Staff & HR (Users icon)
  - [ ] Employees
  - [ ] Departments
  - [ ] Attendance
  - [ ] Leaves
- [ ] Projects (FolderKanban icon)
  - [ ] All Projects
  - [ ] Pipeline
- [ ] Clients (Building2 icon)
  - [ ] All Clients
  - [ ] Contracts
- [ ] Finance (DollarSign/Wallet icon)
  - [ ] Payroll
  - [ ] Expenses
  - [ ] Budgets
- [ ] Communication (MessageSquare icon)
  - [ ] Chat
  - [ ] Announcements
  - [ ] Notifications
- [ ] Culture (Calendar icon)
  - [ ] Events
  - [ ] Polls
  - [ ] Recognitions
- [ ] Audit (Shield icon) [Admin Only]
- [ ] Settings (Settings icon)
  - [ ] Profile
  - [ ] Notifications
  - [ ] Security

### 2.5 TopBar Component
- [ ] Create `src/components/layout/topbar.tsx`
  - [ ] Mobile hamburger menu button
  - [ ] Command palette trigger (Cmd+K)
  - [ ] Global search input
  - [ ] Notification bell with unread badge
  - [ ] Theme toggle button
  - [ ] User avatar dropdown
  - [ ] Breadcrumb trail
  - [ ] Sticky positioning with blur backdrop

### 2.6 Command Palette
- [ ] Create `src/components/command-menu.tsx`
  - [ ] CMD+K keyboard shortcut
  - [ ] Spotlight-style overlay
  - [ ] Search across pages
  - [ ] Search employees
  - [ ] Search projects
  - [ ] Recent items
  - [ ] Keyboard navigation (↑↓, Enter, Esc)
  - [ ] Framer Motion scale animation

### 2.7 Breadcrumb Component
- [ ] Create `src/components/layout/breadcrumb.tsx`
  - [ ] Auto-generated from route
  - [ ] Home link
  - [ ] Separator icons
  - [ ] Current page (non-clickable)

### 2.8 Mobile Navigation
- [ ] Create `src/components/layout/mobile-nav.tsx`
  - [ ] Sheet overlay for mobile
  - [ ] Simplified menu items
  - [ ] Bottom bar for quick actions

---

## Phase 3: Authentication Pages

### 3.1 Auth Layout
- [ ] Create `src/app/(auth)/layout.tsx`
  - [ ] No sidebar
  - [ ] Full-height centered content
  - [ ] Animated gradient background
  - [ ] SyncWork branding

### 3.2 Login Page
- [ ] Create `src/app/(auth)/login/page.tsx`
  - [ ] Centered card layout
  - [ ] Email input field
  - [ ] Password input with show/hide toggle
  - [ ] Remember me checkbox
  - [ ] Forgot password link
  - [ ] Submit button with loading state
  - [ ] Link to register page
  - [ ] Form validation (Zod)
  - [ ] Error handling (invalid credentials)
  - [ ] Success redirect to dashboard
  - [ ] GSAP background animation
  - [ ] Card entrance animation

### 3.3 Register Page
- [ ] Create `src/app/(auth)/register/page.tsx`
  - [ ] Multi-step form:
    - [ ] Step 1: Account info (email, password, confirm)
    - [ ] Step 2: Personal info (first name, last name, phone)
    - [ ] Step 3: Organization (company name, role)
  - [ ] Progress stepper at top
  - [ ] Step transitions (slide left/right)
  - [ ] Form validation per step
  - [ ] Submit to BFF API route
  - [ ] Success message + redirect to login

### 3.4 Forgot Password Page
- [ ] Create `src/app/(auth)/forgot-password/page.tsx`
  - [ ] Email input
  - [ ] Submit button
  - [ ] Success state
  - [ ] Back to login link

---

## Phase 4: Dashboard Module

### 4.1 Dashboard Page
- [ ] Create `src/app/(dashboard)/page.tsx`

### 4.2 Welcome Section
- [ ] Time-based greeting ("Good morning/afternoon/evening")
- [ ] User name display
- [ ] Current date formatting
- [ ] GSAP typewriter/fade-in effect

### 4.3 Stats Grid
- [ ] Create `src/components/stats-card.tsx`
- [ ] Total Projects card (FolderKanban icon)
  - [ ] Count-up animation
  - [ ] Trend indicator
  - [ ] "from last month" text
- [ ] Active Employees card (Users icon)
  - [ ] Count-up animation
  - [ ] Trend indicator
- [ ] Total Clients card (Building2 icon)
  - [ ] Count-up animation
  - [ ] Trend indicator
- [ ] Upcoming Events card (Calendar icon)
  - [ ] Count-up animation
  - [ ] Trend indicator
- [ ] Staggered entrance animation
- [ ] Hover lift effect

### 4.4 Tabbed Content Area
- [ ] Create tabs component
- [ ] **Recent Projects Tab**
  - [ ] 3-4 project cards
  - [ ] Progress bars
  - [ ] Team avatars
  - [ ] Status badges
- [ ] **My Tasks Tab**
  - [ ] Task list
  - [ ] Priority indicators
  - [ ] Due dates
  - [ ] Status
- [ ] **Announcements Tab**
  - [ ] Pinned announcements
  - [ ] Recent announcements
  - [ ] Author info
- [ ] Tab content crossfade animation

### 4.5 Quick Actions
- [ ] Quick action buttons
- [ ] Shortcut to common tasks
- [ ] "Create New" dropdown

### 4.6 Activity Feed
- [ ] Recent activity timeline
- [ ] User avatars
- [ ] Activity descriptions
- [ ] Timestamps

---

## Phase 5: Staff & HR Module

### 5.1 Employee Directory
- [ ] Create `src/app/(dashboard)/staff/page.tsx`
- [ ] Page header with "Add Employee" button
- [ ] Search bar (real-time filter)
- [ ] Department filter dropdown
- [ ] Status filter tabs (All, Active, Inactive, etc.)
- [ ] View toggle (Table / Grid)
- [ ] Data table with columns:
  - [ ] Avatar + Name + Email
  - [ ] Employee Code
  - [ ] Department
  - [ ] Job Title
  - [ ] Status (StatusBadge component)
  - [ ] Actions (View, Edit)
- [ ] Row hover effects
- [ ] Sortable columns
- [ ] Pagination
- [ ] Empty state with illustration

### 5.2 Employee Detail Page
- [ ] Create `src/app/(dashboard)/staff/[id]/page.tsx`
- [ ] Profile header with large avatar
- [ ] Quick info cards:
  - [ ] Department
  - [ ] Manager
  - [ ] Hire Date
  - [ ] Employment Type
- [ ] Tabbed sections:
  - [ ] Overview (personal info, contact)
  - [ ] Documents (file list)
  - [ ] Attendance history (calendar)
  - [ ] Leave requests (list)
  - [ ] Payroll info (salary, bonuses)

### 5.3 Add/Edit Employee Form
- [ ] Create `src/components/forms/employee-form.tsx`
- [ ] Personal info fields
- [ ] Contact info fields
- [ ] Employment details
- [ ] Department selection
- [ ] Manager selection
- [ ] Salary info
- [ ] Form validation (Zod)
- [ ] Animated form entrance

### 5.4 Departments Page
- [ ] Create `src/app/(dashboard)/staff/departments/page.tsx`
- [ ] Department tree/hierarchy
- [ ] Expand/collapse functionality
- [ ] Employee count per department
- [ ] Manager info display
- [ ] Add department button
- [ ] Department detail view

### 5.5 Attendance Page
- [ ] Create `src/app/(dashboard)/staff/attendance/page.tsx`
- [ ] Monthly calendar view
- [ ] Day status indicators:
  - [ ] Present (green dot)
  - [ ] Absent (red dot)
  - [ ] Leave (yellow dot)
  - [ ] Holiday (blue dot)
- [ ] Check-in button with timestamp
- [ ] Check-out button with timestamp
- [ ] Attendance statistics cards:
  - [ ] Present days
  - [ ] Absent days
  - [ ] Leave days
  - [ ] Working hours

### 5.6 Leaves Page
- [ ] Create `src/app/(dashboard)/staff/leaves/page.tsx`
- [ ] Leave request form:
  - [ ] Leave type dropdown
  - [ ] Date range picker
  - [ ] Reason textarea
- [ ] Leave request list
- [ ] Status badges (pending, approved, rejected)
- [ ] Approval workflow for managers
- [ ] Leave balance display
- [ ] Leave calendar view

### 5.7 Staff Components
- [ ] Create `src/components/staff/employee-table.tsx`
- [ ] Create `src/components/staff/employee-card.tsx`
- [ ] Create `src/components/staff/employee-filters.tsx`
- [ ] Create `src/components/staff/department-tree.tsx`
- [ ] Create `src/components/staff/attendance-calendar.tsx`
- [ ] Create `src/components/staff/leave-request-form.tsx`

---

## Phase 6: Projects Module

### 6.1 Projects List Page
- [ ] Create `src/app/(dashboard)/projects/page.tsx`
- [ ] Page header with "New Project" button
- [ ] View toggle (Grid / List / Kanban)
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Search by name

### 6.2 Project Grid View
- [ ] Create `src/components/projects/project-card.tsx`
- [ ] Card with gradient/header
- [ ] Project name
- [ ] Status badge
- [ ] Priority badge
- [ ] Progress bar with percentage
- [ ] Team avatars (overlapping circles)
- [ ] Due date
- [ ] Budget info
- [ ] Description (truncated)
- [ ] Hover lift animation
- [ ] Staggered entrance

### 6.3 Project List View
- [ ] Compact table format
- [ ] Sortable columns
- [ ] Quick actions
- [ ] Status indicators

### 6.4 Project Detail Page
- [ ] Create `src/app/(dashboard)/projects/[id]/page.tsx`
- [ ] Project header with actions (Edit, Delete)
- [ ] Info cards:
  - [ ] Status
  - [ ] Priority
  - [ ] Start/End dates
  - [ ] Budget
  - [ ] Progress
- [ ] Description section
- [ ] Team members list
- [ ] Recent activity timeline
- [ ] Tabbed sections:
  - [ ] Overview
  - [ ] Tasks (Kanban board)
  - [ ] Sprints
  - [ ] Milestones
  - [ ] Settings

### 6.5 Create Project Form
- [ ] Create `src/components/forms/project-form.tsx`
- [ ] Project name
- [ ] Description textarea
- [ ] Client selection
- [ ] Manager selection
- [ ] Status dropdown
- [ ] Priority dropdown
- [ ] Date range picker
- [ ] Budget input
- [ ] Team member selection
- [ ] Tags input

### 6.6 Kanban Board (Tasks)
- [ ] Create `src/app/(dashboard)/projects/[id]/tasks/page.tsx`
- [ ] Create `src/components/kanban/board.tsx`
- [ ] Create `src/components/kanban/column.tsx`
- [ ] Create `src/components/kanban/card.tsx`
- [ ] Columns:
  - [ ] To Do
  - [ ] In Progress
  - [ ] Review
  - [ ] Done
  - [ ] Blocked
- [ ] Drag & drop with `@hello-pangea/dnd`
- [ ] Task cards with:
  - [ ] Title
  - [ ] Assignee avatar
  - [ ] Priority indicator
  - [ ] Tags
  - [ ] Due date
  - [ ] Subtask count
- [ ] Add task button (quick create)
- [ ] Column headers with task count
- [ ] Drag animations (scale, shadow, rotation)
- [ ] Drop animations (smooth snap)
- [ ] Column entrance animations

### 6.7 Sprint Management
- [ ] Create `src/app/(dashboard)/projects/[id]/sprints/page.tsx`
- [ ] Sprint cards with timeline
- [ ] Burndown chart (Recharts)
- [ ] Velocity metrics
- [ ] Start/Complete sprint buttons
- [ ] Sprint creation form
- [ ] Task assignment to sprints

### 6.8 Milestones
- [ ] Create `src/app/(dashboard)/projects/[id]/milestones/page.tsx`
- [ ] Milestone timeline
- [ ] Status tracking
- [ ] Deliverables list
- [ ] Add milestone form

---

## Phase 7: Pipeline Module (Kanban)

### 7.1 Pipeline Board
- [ ] Create `src/app/(dashboard)/pipeline/page.tsx`
- [ ] Global pipeline view (all projects)
- [ ] Board with stages
- [ ] Drag tasks between stages
- [ ] Swimlane view option (by project/assignee)
- [ ] Filters:
  - [ ] By assignee
  - [ ] By priority
  - [ ] By due date
  - [ ] By project
- [ ] Quick task creation
- [ ] Task detail modal on click

### 7.2 Pipeline Components
- [ ] Create `src/components/pipeline/board.tsx`
- [ ] Create `src/components/pipeline/swimlane.tsx`
- [ ] Create `src/components/pipeline/filters.tsx`

---

## Phase 8: Clients Module

### 8.1 Clients List
- [ ] Create `src/app/(dashboard)/clients/page.tsx`
- [ ] Grid of client cards
- [ ] List view option
- [ ] Search by name
- [ ] Filter by industry
- [ ] Filter by status

### 8.2 Client Card
- [ ] Create `src/components/clients/client-card.tsx`
- [ ] Logo placeholder with initials
- [ ] Company name
- [ ] Industry tag
- [ ] Status badge
- [ ] Revenue/contract value
- [ ] Contact person
- [ ] Hover effects

### 8.3 Client Detail
- [ ] Create `src/app/(dashboard)/clients/[id]/page.tsx`
- [ ] Company info header
- [ ] Contact persons list
- [ ] Projects list
- [ ] Contracts section
- [ ] Notes/activity timeline
- [ ] Tabbed sections:
  - [ ] Overview
  - [ ] Projects
  - [ ] Contracts
  - [ ] Communications

### 8.4 Contracts
- [ ] Create `src/app/(dashboard)/clients/contracts/page.tsx`
- [ ] Contract timeline
- [ ] Status tracking (draft, active, expired)
- [ ] Document attachments
- [ ] Contract creation form

### 8.5 Client Components
- [ ] Create `src/components/clients/client-form.tsx`
- [ ] Create `src/components/clients/contract-card.tsx`

---

## Phase 9: Finance Module

### 9.1 Payroll Page
- [ ] Create `src/app/(dashboard)/finance/payroll/page.tsx`
- [ ] Payroll period selector
- [ ] Employee salary table
- [ ] Payslip generation
- [ ] Payment status tracking
- [ ] Payroll statistics cards

### 9.2 Expenses Page
- [ ] Create `src/app/(dashboard)/finance/expenses/page.tsx`
- [ ] Expense submission form:
  - [ ] Category dropdown
  - [ ] Amount input
  - [ ] Date picker
  - [ ] Description textarea
  - [ ] Receipt upload (drag & drop)
- [ ] Expense list with status
- [ ] Approval workflow:
  - [ ] Pending badge
  - [ ] Approved badge
  - [ ] Rejected badge
- [ ] Expense categories chart (Recharts)
- [ ] Expense statistics

### 9.3 Budgets Page
- [ ] Create `src/app/(dashboard)/finance/budgets/page.tsx`
- [ ] Budget overview cards
- [ ] Progress bars (spent vs total)
- [ ] Project allocation view
- [ ] Over-budget alerts
- [ ] Budget creation form
- [ ] Budget vs actual chart

### 9.4 Finance Components
- [ ] Create `src/components/finance/expense-form.tsx`
- [ ] Create `src/components/finance/budget-card.tsx`
- [ ] Create `src/components/finance/payroll-table.tsx`

---

## Phase 10: Communication Module

### 10.1 Chat Page
- [ ] Create `src/app/(dashboard)/communication/chat/page.tsx`

### 10.2 Channel Sidebar
- [ ] Create `src/components/chat/room-list.tsx`
- [ ] Channel list (30% width)
- [ ] Channel name with # icon
- [ ] Unread count badge
- [ ] Online indicator for DMs
- [ ] Search channels
- [ ] Create channel button
- [ ] Channel categories (Direct, Group, Project)

### 10.3 Message Area
- [ ] Create `src/components/chat/message-list.tsx`
- [ ] Messages grouped by date
- [ ] Avatar + name + timestamp
- [ ] Message bubble design
- [ ] Reactions (emoji)
- [ ] Reply threading
- [ ] Edit message
- [ ] Delete message
- [ ] Typing indicator (bouncing dots)
- [ ] New message separator

### 10.4 Message Input
- [ ] Create `src/components/chat/message-input.tsx`
- [ ] Textarea with auto-grow
- [ ] Emoji picker
- [ ] Attachment button
- [ ] Send button
- [ ] Keyboard shortcuts (Enter to send, Shift+Enter for newline)

### 10.5 Message Bubble
- [ ] Create `src/components/chat/message-bubble.tsx`
- [ ] Own messages (right aligned, primary color)
- [ ] Others' messages (left aligned, muted color)
- [ ] Timestamp on hover
- [ ] Read receipts
- [ ] Reaction bar

### 10.6 Chat Animations
- [ ] New message slide in from bottom
- [ ] Channel switch crossfade
- [ ] Typing indicator bounce
- [ ] Message send scale effect

### 10.7 Announcements Page
- [ ] Create `src/app/(dashboard)/communication/announcements/page.tsx`
- [ ] Pinned announcements (top section)
- [ ] Regular announcement cards
- [ ] Priority indicators:
  - [ ] Urgent (red)
  - [ ] High (orange)
  - [ ] Normal (blue)
- [ ] Author info with avatar
- [ ] Publish date
- [ ] Expiry date
- [ ] Acknowledge button
- [ ] Read receipt count
- [ ] Create announcement form (admin/manager)

### 10.8 Notifications Page
- [ ] Create `src/app/(dashboard)/communication/notifications/page.tsx`
- [ ] Notification list
- [ ] Filter: All / Unread
- [ ] Mark all as read button
- [ ] Group by date (Today, Yesterday, Earlier)
- [ ] Notification types:
  - [ ] Task assigned
  - [ ] Mentioned in chat
  - [ ] Leave approved/rejected
  - [ ] Project update
  - [ ] System notification
- [ ] Action buttons (View, Dismiss)
- [ ] Dropdown panel from top bar
- [ ] Max 10 recent in dropdown
- [ ] "View all" link

### 10.9 Notification Badge
- [ ] Create `src/components/notifications/badge.tsx`
- [ ] Bell icon in top bar
- [ ] Unread count badge (red)
- [ ] Pulse animation when new
- [ ] Dropdown panel on click

---

## Phase 11: Culture Module

### 11.1 Events Page
- [ ] Create `src/app/(dashboard)/culture/events/page.tsx`
- [ ] Calendar view (monthly)
- [ ] Event cards:
  - [ ] Banner image
  - [ ] Title
  - [ ] Date & time
  - [ ] Location
  - [ ] Description
  - [ ] Max participants
- [ ] Registration button
- [ ] Attendee avatars
- [ ] Event types filter (hackathon, game_night, etc.)
- [ ] Create event form (admin)

### 11.2 Polls Page
- [ ] Create `src/app/(dashboard)/culture/polls/page.tsx`
- [ ] Active polls list
- [ ] Voting interface:
  - [ ] Single choice (radio)
  - [ ] Multiple choice (checkbox)
  - [ ] Rating (stars)
- [ ] Results view with animated bars
- [ ] Poll expiration timer
- [ ] Create poll form (admin)
- [ ] Poll results chart

### 11.3 Recognitions Page
- [ ] Create `src/app/(dashboard)/culture/recognitions/page.tsx`
- [ ] Give kudos form:
  - [ ] Recipient selection
  - [ ] Message textarea
  - [ ] Points selection
  - [ ] Recognition type (kudos, award, milestone)
- [ ] Recognition feed
- [ ] Points display
- [ ] Leaderboard table
- [ ] Confetti animation on new recognition
- [ ] Recognition cards with avatars

### 11.4 Culture Components
- [ ] Create `src/components/culture/event-card.tsx`
- [ ] Create `src/components/culture/poll-card.tsx`
- [ ] Create `src/components/culture/recognition-card.tsx`
- [ ] Create `src/components/culture/leaderboard.tsx`

---

## Phase 12: Audit Module (Admin Only)

### 12.1 Audit Page
- [ ] Create `src/app/(dashboard)/audit/page.tsx`
- [ ] Activity log table
- [ ] Columns:
  - [ ] Timestamp
  - [ ] User
  - [ ] Action
  - [ ] Resource
  - [ ] Details
  - [ ] IP Address
- [ ] Filters:
  - [ ] Date range
  - [ ] User
  - [ ] Action type
  - [ ] Resource type
- [ ] Export to CSV/Excel
- [ ] Pagination
- [ ] Admin-only access (PermissionGate)

---

## Phase 13: Settings Module

### 13.1 Profile Settings
- [ ] Create `src/app/(dashboard)/settings/profile/page.tsx`
- [ ] Avatar upload with preview
- [ ] Personal info form:
  - [ ] First name
  - [ ] Last name
  - [ ] Email
  - [ ] Phone
  - [ ] Bio
- [ ] Change password form:
  - [ ] Current password
  - [ ] New password
  - [ ] Confirm new password
- [ ] Form validation

### 13.2 Notification Settings
- [ ] Create `src/app/(dashboard)/settings/notifications/page.tsx`
- [ ] Email preferences toggle
- [ ] Push notification toggle
- [ ] Notification types:
  - [ ] Task assignments
  - [ ] Mentions
  - [ ] Project updates
  - [ ] Leave approvals
  - [ ] Announcements
- [ ] Digest frequency (daily, weekly, never)
- [ ] Quiet hours

### 13.3 Security Settings
- [ ] Create `src/app/(dashboard)/settings/security/page.tsx`
- [ ] Two-factor authentication setup
- [ ] Active sessions list
- [ ] Session revoke button
- [ ] API keys management
- [ ] Login history
- [ ] Security alerts

---

## Phase 14: Component Library

### 14.1 Layout Components
- [ ] `src/components/layout/sidebar.tsx`
- [ ] `src/components/layout/topbar.tsx`
- [ ] `src/components/layout/breadcrumb.tsx`
- [ ] `src/components/layout/command-menu.tsx`
- [ ] `src/components/layout/mobile-nav.tsx`

### 14.2 Page Components
- [ ] `src/components/page-header.tsx`
  - [ ] Animated title
  - [ ] Description text
  - [ ] Action slot
  - [ ] Breadcrumb integration

### 14.3 Data Display Components
- [ ] `src/components/stats-card.tsx`
  - [ ] Icon with colored background
  - [ ] Value with count-up
  - [ ] Trend indicator
  - [ ] Hover animation
- [ ] `src/components/data-table.tsx`
  - [ ] Built on TanStack Table
  - [ ] Sorting
  - [ ] Filtering
  - [ ] Pagination
  - [ ] Row animations
  - [ ] Skeleton loading
  - [ ] Empty state
- [ ] `src/components/status-badge.tsx`
  - [ ] Predefined status mappings
  - [ ] Color variants (semantic colors)
  - [ ] Size variants (sm, md, lg)
- [ ] `src/components/avatar-group.tsx`
  - [ ] Overlapping avatars
  - [ ] Max display limit
  - [ ] Tooltip with full list

### 14.4 Form Components
- [ ] `src/components/forms/form-field.tsx`
  - [ ] Label + input + error
  - [ ] Animated error shake
  - [ ] Focus ring animation
- [ ] `src/components/forms/search-input.tsx`
  - [ ] Search icon
  - [ ] Clear button
  - [ ] Loading state
- [ ] `src/components/forms/date-range-picker.tsx`
  - [ ] Start date
  - [ ] End date
  - [ ] Preset ranges

### 14.5 Animation Components
- [ ] `src/components/animations/page-transition.tsx`
  - [ ] AnimatePresence wrapper
  - [ ] Fade + slide variants
- [ ] `src/components/animations/fade-in.tsx`
  - [ ] Reusable fade wrapper
- [ ] `src/components/animations/stagger-container.tsx`
  - [ ] Staggered children entrance
- [ ] `src/components/animations/count-up.tsx`
  - [ ] Animated number counting
  - [ ] GSAP integration
- [ ] `src/components/animations/confetti.tsx`
  - [ ] Celebration animation
  - [ ] Trigger on recognition

### 14.6 Loading States
- [ ] `src/components/loading/page-skeleton.tsx`
- [ ] `src/components/loading/card-skeleton.tsx`
- [ ] `src/components/loading/table-skeleton.tsx`
- [ ] `src/components/loading/spinner.tsx`
- [ ] Shimmer effect

### 14.7 Empty States
- [ ] `src/components/empty-state.tsx`
  - [ ] Illustration/icon
  - [ ] Title
  - [ ] Description
  - [ ] CTA button

### 14.8 Feedback Components
- [ ] `src/components/feedback/toast-container.tsx`
- [ ] `src/components/feedback/confirmation-dialog.tsx`
- [ ] `src/components/feedback/error-boundary.tsx`

---

## Phase 15: State Management & Hooks

### 15.1 Auth Hooks
- [ ] `src/hooks/use-auth.ts`
  - [ ] Login mutation
  - [ ] Logout mutation
  - [ ] Get current user query
  - [ ] Auth status
- [ ] `src/hooks/use-permissions.ts`
  - [ ] Permission checking
  - [ ] Role checking
  - [ ] Dynamic sidebar filtering

### 15.2 Data Hooks (TanStack Query)
- [ ] `src/hooks/use-users.ts`
  - [ ] useUsers (list)
  - [ ] useUser (detail)
  - [ ] useCreateUser
  - [ ] useUpdateUser
  - [ ] useDeleteUser
- [ ] `src/hooks/use-staff.ts`
  - [ ] useEmployees
  - [ ] useEmployee
  - [ ] useCreateEmployee
  - [ ] useUpdateEmployee
  - [ ] useDepartments
  - [ ] useAttendance
  - [ ] useCheckIn/CheckOut
  - [ ] useLeaves
  - [ ] useCreateLeave
- [ ] `src/hooks/use-projects.ts`
  - [ ] useProjects
  - [ ] useProject
  - [ ] useCreateProject
  - [ ] useUpdateProject
  - [ ] useDeleteProject
  - [ ] useTasks
  - [ ] useCreateTask
  - [ ] useUpdateTask
  - [ ] useSprints
  - [ ] useMilestones
- [ ] `src/hooks/use-clients.ts`
  - [ ] useClients
  - [ ] useClient
  - [ ] useCreateClient
  - [ ] useContracts
- [ ] `src/hooks/use-finance.ts`
  - [ ] usePayroll
  - [ ] useExpenses
  - [ ] useCreateExpense
  - [ ] useBudgets
- [ ] `src/hooks/use-communication.ts`
  - [ ] useRooms
  - [ ] useMessages
  - [ ] useSendMessage
  - [ ] useAnnouncements
  - [ ] useNotifications
  - [ ] useMarkAsRead
- [ ] `src/hooks/use-culture.ts`
  - [ ] useEvents
  - [ ] usePolls
  - [ ] useVotePoll
  - [ ] useRecognitions
  - [ ] useLeaderboard

### 15.3 UI Hooks
- [ ] `src/hooks/use-sidebar.ts`
- [ ] `src/hooks/use-theme.ts`
- [ ] `src/hooks/use-command-menu.ts`
- [ ] `src/hooks/use-notifications-panel.ts`
- [ ] `src/hooks/use-mobile.ts`
- [ ] `src/hooks/use-debounce.ts`
- [ ] `src/hooks/use-local-storage.ts`
- [ ] `src/hooks/use-media-query.ts`
- [ ] `src/hooks/use-focus-trap.ts`

---

## Phase 16: Services (API Integration)

### 16.1 Auth Service
- [ ] `src/services/auth.ts`
  - [ ] login(credentials)
  - [ ] register(data)
  - [ ] logout()
  - [ ] getMe()
  - [ ] refreshToken()
  - [ ] forgotPassword(email)
  - [ ] resetPassword(token, password)

### 16.2 User Service
- [ ] `src/services/users.ts`
  - [ ] getUsers(params)
  - [ ] getUser(id)
  - [ ] updateUser(id, data)
  - [ ] deleteUser(id)
  - [ ] changePassword(id, data)
  - [ ] assignRole(userId, roleId)
  - [ ] getRoles()
  - [ ] getPermissions()

### 16.3 Staff Service
- [ ] `src/services/staff.ts`
  - [ ] getEmployees(params)
  - [ ] getEmployee(id)
  - [ ] createEmployee(data)
  - [ ] updateEmployee(id, data)
  - [ ] deleteEmployee(id)
  - [ ] getDepartments()
  - [ ] createDepartment(data)
  - [ ] checkIn(data)
  - [ ] checkOut(data)
  - [ ] getAttendance(params)
  - [ ] getLeaves()
  - [ ] createLeave(data)
  - [ ] approveLeave(id)
  - [ ] rejectLeave(id, reason)

### 16.4 Project Service
- [ ] `src/services/projects.ts`
  - [ ] getProjects(params)
  - [ ] getProject(id)
  - [ ] createProject(data)
  - [ ] updateProject(id, data)
  - [ ] deleteProject(id)
  - [ ] getTasks(projectId)
  - [ ] createTask(projectId, data)
  - [ ] updateTask(id, data)
  - [ ] assignTask(taskId, assigneeId)
  - [ ] updateTaskStatus(taskId, status)
  - [ ] getSprints(projectId)
  - [ ] createSprint(projectId, data)
  - [ ] startSprint(id)
  - [ ] completeSprint(id)
  - [ ] getMilestones(projectId)
  - [ ] createMilestone(projectId, data)
  - [ ] getPipelines()
  - [ ] createPipeline(data)

### 16.5 Client Service
- [ ] `src/services/clients.ts`
  - [ ] getClients()
  - [ ] getClient(id)
  - [ ] createClient(data)
  - [ ] updateClient(id, data)
  - [ ] deleteClient(id)
  - [ ] getContracts()
  - [ ] createContract(data)

### 16.6 Finance Service
- [ ] `src/services/finance.ts`
  - [ ] getPayroll(params)
  - [ ] processPayroll(data)
  - [ ] getExpenses()
  - [ ] getMyExpenses()
  - [ ] createExpense(data)
  - [ ] approveExpense(id)
  - [ ] rejectExpense(id, reason)
  - [ ] getBudgets()
  - [ ] createBudget(data)
  - [ ] updateBudget(id, data)

### 16.7 Communication Service
- [ ] `src/services/communication.ts`
  - [ ] getRooms()
  - [ ] createRoom(data)
  - [ ] joinRoom(roomId)
  - [ ] getMessages(roomId, params)
  - [ ] sendMessage(roomId, data)
  - [ ] getAnnouncements()
  - [ ] createAnnouncement(data)
  - [ ] acknowledgeAnnouncement(id)
  - [ ] getNotifications()
  - [ ] getUnreadCount()
  - [ ] markAsRead(id)
  - [ ] markAllAsRead()

### 16.8 Culture Service
- [ ] `src/services/culture.ts`
  - [ ] getEvents()
  - [ ] createEvent(data)
  - [ ] registerForEvent(id)
  - [ ] getPolls()
  - [ ] createPoll(data)
  - [ ] voteInPoll(pollId, optionId)
  - [ ] getRecognitions()
  - [ ] createRecognition(data)
  - [ ] getLeaderboard()

---

## Phase 17: WebSocket Integration

### 17.1 WebSocket Client
- [ ] Create `src/lib/websocket/client.ts`
  - [ ] WebSocketManager class
  - [ ] Connection management
  - [ ] Auto-reconnect with exponential backoff
  - [ ] Heartbeat ping/pong
  - [ ] Event listeners
  - [ ] Message sending
  - [ ] Connection status tracking

### 17.2 WebSocket Provider
- [ ] Create `src/components/providers/websocket-provider.tsx`
  - [ ] Connect on auth
  - [ ] Disconnect on logout
  - [ ] Connection status toast
  - [ ] Reconnection notifications

### 17.3 WebSocket Hooks
- [ ] `src/hooks/use-websocket.ts`
  - [ ] Subscribe to events
  - [ ] Send messages
  - [ ] Connection status
- [ ] `src/hooks/use-chat-websocket.ts`
  - [ ] Real-time messages
  - [ ] Typing indicators
  - [ ] Presence updates
- [ ] `src/hooks/use-notifications-websocket.ts`
  - [ ] Real-time notifications
  - [ ] Badge updates
  - [ ] Toast triggers

### 17.4 Real-Time Features
- [ ] Chat messages (real-time)
- [ ] Typing indicators
- [ ] Online presence
- [ ] Notifications (real-time)
- [ ] Task updates
- [ ] Dashboard live updates

---

## Phase 18: File Upload System

### 18.1 Upload Service
- [ ] Create `src/lib/api/upload.ts`
  - [ ] uploadFile function
  - [ ] Progress tracking
  - [ ] File validation
  - [ ] Error handling

### 18.2 Upload Components
- [ ] Create `src/components/upload/dropzone.tsx`
  - [ ] Drag & drop zone
  - [ ] File preview
  - [ ] Progress bar
  - [ ] File type icons
  - [ ] Remove file button
- [ ] Create `src/components/upload/file-preview.tsx`
  - [ ] Image preview
  - [ ] Document preview
  - [ ] Download button

### 18.3 Upload Hooks
- [ ] `src/hooks/use-upload.ts`
  - [ ] useUploadFile mutation
  - [ ] Progress state
  - [ ] Success/error handling

---

## Phase 19: RBAC & Permissions

### 19.1 Permission System
- [ ] Create `src/lib/auth/permissions.ts`
  - [ ] Permission enum
  - [ ] Role-permission mapping
  - [ ] Permission checking helpers

### 19.2 Permission Components
- [ ] `src/components/auth/permission-gate.tsx`
  - [ ] Single permission check
  - [ ] Fallback support
- [ ] `src/components/auth/permission-any-gate.tsx`
  - [ ] Multiple permission check (any)
- [ ] `src/components/auth/role-gate.tsx`
  - [ ] Role-based access

### 19.3 Permission Hooks
- [ ] `src/hooks/use-permissions.ts`
  - [ ] hasPermission()
  - [ ] hasAnyPermission()
  - [ ] hasAllPermissions()
  - [ ] isAdmin
  - [ ] isManager

### 19.4 Dynamic UI Based on Permissions
- [ ] Sidebar menu items hidden by permission
- [ ] Action buttons hidden by permission
- [ ] Routes protected by permission
- [ ] Audit page admin-only
- [ ] Finance actions manager-only

---

## Phase 20: Animation & Micro-interactions

### 20.1 Global Animations
- [ ] Page transition (fade + slide)
- [ ] Route change animation
- [ ] Theme transition (smooth color change)
- [ ] Loading state transitions

### 20.2 Component Animations
| Element | Animation | Library |
|---------|-----------|---------|
| Buttons - Hover | Scale 1.02, shadow | Framer Motion |
| Buttons - Active | Scale 0.98 | Framer Motion |
| Cards - Hover | Y: -4px, shadow-lg | Framer Motion |
| Sidebar Items - Hover | X: +2px, bg shift | CSS Transition |
| Inputs - Focus | Ring expansion | CSS Transition |
| Badges - New | Pulse | Framer Motion |
| Modals - Open | Scale 0.95→1 + fade | Framer Motion |
| Modals - Close | Scale 1→0.95 + fade out | Framer Motion |
| Dropdowns - Open | Slide down + fade | Framer Motion |
| Toasts - Enter | Slide from right | Sonner |
| Progress Bars | Width 0→value | GSAP |
| Numbers/Stats | CountUp 0→value | GSAP |
| Table Rows | Stagger fade+slide | Framer Motion |
| Kanban Cards - Drag | Scale 1.05 + shadow + rotation | Framer Motion |
| Chat Messages | Slide in from bottom | Framer Motion |
| Theme Toggle | Icon rotation + morph | GSAP |

### 20.3 Page Entrance Sequences
- [ ] Dashboard entrance timeline (GSAP)
  - [ ] Sidebar slides in
  - [ ] Top bar fades in
  - [ ] Stats cards stagger in
  - [ ] Content area fades up
- [ ] Table pages: Header → Filters → Table rows stagger
- [ ] Detail pages: Header → Cards → Tabs → Content

### 20.4 Special Animations
- [ ] Confetti on recognition
- [ ] Success checkmark animation
- [ ] Error shake animation
- [ ] Notification badge pulse
- [ ] Typing indicator bounce
- [ ] Skeleton shimmer effect

---

## Phase 21: Responsive Design

### 21.1 Breakpoints
- [ ] Mobile: < 768px
- [ ] Tablet: 768px - 1024px
- [ ] Desktop: > 1024px

### 21.2 Mobile Adaptations
- [ ] Sidebar: Sheet overlay (not persistent)
- [ ] Tables: Horizontal scroll with sticky first column
- [ ] Cards: Single column stack
- [ ] Chat: Channel list as bottom sheet
- [ ] Kanban: Horizontal scroll or list toggle
- [ ] Top bar: Hamburger menu, search icon only
- [ ] Stats grid: 1 column on mobile, 2 on tablet

### 21.3 Touch Optimizations
- [ ] Minimum tap target 44px
- [ ] Swipe gestures (mobile)
- [ ] Bottom sheet for mobile modals
- [ ] Pull-to-refresh (optional)

### 21.4 Responsive Components
- [ ] Responsive sidebar
- [ ] Responsive table
- [ ] Responsive grid layouts
- [ ] Responsive typography
- [ ] Responsive spacing

---

## Phase 22: Dark Mode

### 22.1 Theme Implementation
- [ ] CSS variables for light/dark (already in globals.css)
- [ ] next-themes integration
- [ ] System preference detection
- [ ] Manual toggle (Light/Dark/System)
- [ ] Smooth transitions (300ms)

### 22.2 Dark Mode Components
- [ ] Theme toggle button
  - [ ] Sun icon (light mode)
  - [ ] Moon icon (dark mode)
  - [ ] Rotation animation on toggle
- [ ] Theme-aware components
  - [ ] Charts (adaptive colors)
  - [ ] Images (brightness filter)
  - [ ] Code blocks (syntax highlighting)

### 22.3 Dark Mode Testing
- [ ] All pages tested in dark mode
- [ ] All components visible in dark mode
- [ ] No hardcoded colors
- [ ] Proper contrast ratios

---

## Phase 23: Performance Optimization

### 23.1 Code Splitting
- [ ] Dynamic imports for heavy components
- [ ] Lazy load charts
- [ ] Lazy load modals
- [ ] Route-based code splitting

### 23.2 Image Optimization
- [ ] Use Next.js Image component
- [ ] Proper sizing
- [ ] Blur placeholders
- [ ] WebP format

### 23.3 State Optimization
- [ ] React.memo for expensive components
- [ ] useMemo for computations
- [ ] useCallback for functions
- [ ] Proper dependency arrays

### 23.4 Data Fetching Optimization
- [ ] TanStack Query caching
- [ ] Prefetching on hover
- [ ] Infinite scroll for long lists
- [ ] Optimistic updates

### 23.5 Bundle Optimization
- [ ] Tree shaking
- [ ] Dead code elimination
- [ ] Bundle analysis
- [ ] < 200KB first load JS per route

---

## Phase 24: Accessibility (a11y)

### 24.1 Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Tab order logical
- [ ] Focus visible indicators
- [ ] Escape key closes modals
- [ ] Enter/Space activates buttons

### 24.2 Screen Reader Support
- [ ] Semantic HTML
- [ ] ARIA labels
- [ ] Role attributes
- [ ] Live regions for notifications
- [ ] Alt text for images

### 24.3 Visual Accessibility
- [ ] Color contrast WCAG 2.1 AA
- [ ] Focus indicators visible
- [ ] Text resizing support
- [ ] Reduced motion support (`prefers-reduced-motion`)

### 24.4 Form Accessibility
- [ ] Labels associated with inputs
- [ ] Error messages announced
- [ ] Required field indicators
- [ ] Fieldset/legend for groups

---

## Phase 25: Testing

### 25.1 Unit Tests (Vitest)
- [ ] Setup Vitest
- [ ] Test utility functions
- [ ] Test hooks
- [ ] Test stores
- [ ] 80% coverage target

### 25.2 Integration Tests (React Testing Library)
- [ ] Test components
- [ ] Test forms
- [ ] Test data fetching
- [ ] Test user interactions

### 25.3 E2E Tests (Playwright)
- [ ] Test critical paths:
  - [ ] Login flow
  - [ ] Create project
  - [ ] Add employee
  - [ ] Send message
  - [ ] Create expense
- [ ] Test responsive layouts
- [ ] Test accessibility

### 25.4 Performance Tests
- [ ] Lighthouse CI
- [ ] Web Vitals monitoring
- [ ] Bundle size checks

---

## Phase 26: Security Implementation

### 26.1 Authentication Security
- [ ] httpOnly cookies for refresh token
- [ ] Short-lived access tokens (15 min)
- [ ] CSRF protection
- [ ] Rate limiting on auth endpoints
- [ ] Secure password handling

### 26.2 HTTP Security Headers
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Content-Security-Policy
- [ ] Permissions-Policy
- [ ] HSTS (production)

### 26.3 Input Validation
- [ ] Zod schemas for all forms
- [ ] Server-side validation
- [ ] XSS prevention (sanitize HTML)
- [ ] SQL injection prevention (parameterized queries)

### 26.4 Other Security
- [ ] Secure cookie flags
- [ ] HTTPS only (production)
- [ ] API request tracing (X-Request-ID)
- [ ] Error message sanitization

---

## Phase 27: Deployment

### 27.1 Cloudflare Workers Setup
- [ ] Configure `wrangler.toml`
- [ ] Setup environment variables
- [ ] Configure routes
- [ ] Test edge deployment

### 27.2 Next.js Configuration
- [ ] `output: 'standalone'`
- [ ] Image domains configuration
- [ ] API rewrites
- [ ] Headers configuration

### 27.3 CI/CD Pipeline
- [ ] GitHub Actions workflow
- [ ] Automated testing
- [ ] Preview deployments for PRs
- [ ] Production deployment
- [ ] Automated rollback

### 27.4 Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (Plausible/PostHog)
- [ ] Web Vitals monitoring
- [ ] WebSocket connection metrics

---

## Phase 28: Documentation

### 28.1 Code Documentation
- [ ] JSDoc for utilities
- [ ] Component prop types
- [ ] Hook documentation
- [ ] Service documentation

### 28.2 README Files
- [ ] Root README (setup, development)
- [ ] API integration guide
- [ ] Component library storybook (optional)

### 28.3 Environment Documentation
- [ ] Development setup
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Environment variables

---

## Verification Checklist Summary

### Critical Path (Must Have)
- [ ] Authentication (login/register/logout)
- [ ] Dashboard with stats
- [ ] Staff directory (CRUD)
- [ ] Projects list (CRUD)
- [ ] Kanban board (drag & drop)
- [ ] Chat interface
- [ ] Notifications
- [ ] Settings (profile)
- [ ] Dark mode toggle
- [ ] Responsive design

### High Priority
- [ ] RBAC permissions
- [ ] WebSocket real-time
- [ ] File uploads
- [ ] Finance module
- [ ] Clients module
- [ ] Announcements
- [ ] Leave management
- [ ] Attendance tracking

### Medium Priority
- [ ] Audit log
- [ ] Culture module (events, polls)
- [ ] Recognitions
- [ ] Advanced search
- [ ] Command palette
- [ ] Export functionality

### Nice to Have
- [ ] Offline support (service worker)
- [ ] PWA capabilities
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] AI integrations

---

## Notes & References

### Architecture Documents
- `Docs/SYNC_WORK_FRONTEND_ARCHITECTURE.md` - Main architecture
- `Docs/FRONTEND_API_INTEGRATION_GUIDE.md` - API integration patterns
- `Docs/FRONTEND_UI_IMPLEMENTATION_GUIDE.md` - UI implementation details
- `Docs/FRONTEND_PRODUCTION_PLAN.md` - Production deployment plan

### Design System
- `src/app/globals.css` - CSS variables (DO NOT MODIFY)
- Tailwind CSS utility classes
- shadcn/ui components

### Key Decisions
1. **Authentication**: BFF Pattern with httpOnly cookies (NOT localStorage)
2. **State Management**: Zustand (client) + TanStack Query (server)
3. **Animations**: Framer Motion (React) + GSAP (complex timelines)
4. **Styling**: Tailwind CSS + CSS variables from globals.css
5. **Forms**: React Hook Form + Zod validation
6. **Real-time**: WebSocket (NOT polling)
7. **Deployment**: Cloudflare Workers (edge)

### CSS Variables (from globals.css)
Use ONLY these variables:
- `bg-background`, `bg-card`, `bg-primary`, `bg-secondary`, `bg-muted`, `bg-accent`
- `text-foreground`, `text-primary-foreground`, `text-secondary-foreground`, `text-muted-foreground`
- `border-border`, `border-input`, `border-ring`
- Semantic status colors: `text-green-500`, `bg-red-500/10`, etc.

**DO NOT use**: Inline colors, arbitrary Tailwind values with colors, custom hex/rgb

---

## Progress Tracker

| Phase | Description | Status | Completion Date |
|-------|-------------|--------|-----------------|
| 0 | Project Setup | [ ] | |
| 1 | Core Infrastructure | [ ] | |
| 2 | Layout Shell | [ ] | |
| 3 | Authentication | [ ] | |
| 4 | Dashboard | [ ] | |
| 5 | Staff & HR | [ ] | |
| 6 | Projects | [ ] | |
| 7 | Pipeline | [ ] | |
| 8 | Clients | [ ] | |
| 9 | Finance | [ ] | |
| 10 | Communication | [ ] | |
| 11 | Culture | [ ] | |
| 12 | Audit | [ ] | |
| 13 | Settings | [ ] | |
| 14 | Components | [ ] | |
| 15 | State Management | [ ] | |
| 16 | Services | [ ] | |
| 17 | WebSocket | [ ] | |
| 18 | File Upload | [ ] | |
| 19 | RBAC | [ ] | |
| 20 | Animations | [ ] | |
| 21 | Responsive | [ ] | |
| 22 | Dark Mode | [ ] | |
| 23 | Performance | [ ] | |
| 24 | Accessibility | [ ] | |
| 25 | Testing | [ ] | |
| 26 | Security | [ ] | |
| 27 | Deployment | [ ] | |
| 28 | Documentation | [ ] | |

---

**Total Estimated Duration**: ~15-20 days (full-time)
**Priority**: Critical Path first, then high priority features
**Last Updated**: 2025-01-25
