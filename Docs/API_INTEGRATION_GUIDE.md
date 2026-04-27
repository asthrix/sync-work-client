# SyncWork API Reference & Frontend Integration Guide

## Table of Contents
- [Overview](#overview)
- [ID Format Standards](#id-format-standards)
- [API Categories](#api-categories)
  - [Essential APIs](#essential-apis)
  - [Optional/Extended APIs](#optionalextended-apis)
  - [Recommended for Removal](#recommended-for-removal)
- [Authentication](#authentication)
- [User Management](#user-management)
- [Roles & Permissions](#roles--permissions)
- [Staff Management](#staff-management)
- [Departments](#departments)
- [Attendance](#attendance)
- [Leave Management](#leave-management)
- [Performance Reviews](#performance-reviews)
- [Projects](#projects)
- [Tasks](#tasks)
- [Sprints](#sprints)
- [Milestones](#milestones)
- [Pipelines](#pipelines)
- [Chat](#chat)
- [Announcements](#announcements)
- [Notifications](#notifications)
- [Culture](#culture)
- [Clients & CRM](#clients--crm)
- [Finance](#finance)
- [Audit & Compliance](#audit--compliance)
- [UI Screen Mapping](#ui-screen-mapping)

---

## Overview

**Base URL:** `http://localhost:8080/api/v1`  
**WebSocket:** `ws://localhost:8080/ws`  
**Swagger UI:** `http://localhost:8080/swagger/index.html`

### Authentication
All protected endpoints require: `Authorization: Bearer <token>`

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### List Response Format
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

---

## ID Format Standards

### Employee IDs
- **Format:** `EMP001`, `EMP002`, etc.
- **Auto-generated:** Yes, sequential
- **Unique:** Yes, enforced at database level
- **Usage:** Use this as the public employee identifier

### Manager IDs
- **Format:** Same as Employee IDs (`EMPxxx`)
- **Note:** Managers are employees with managerial responsibilities
- **Usage:** Reference managers using their employee ID

### Department IDs
- **Format:** `DEPT001`, `DEPT002`, etc. (optional, can use UUID)
- **Code:** Unique department code (e.g., `ENG`, `HR`, `FIN`)

### Other IDs
- **Projects, Tasks, etc.:** UUID format (standard)
- **Users:** UUID format (internal)

### Multiple Roles Per Employee
Employees can now have multiple roles/positions:
```json
{
  "employee_id": "EMP001",
  "job_title": "Software Engineer",
  "roles": [
    {
      "role_name": "Backend Developer",
      "is_primary": true
    },
    {
      "role_name": "Tech Lead",
      "is_primary": false
    }
  ]
}
```

---

## API Categories

### Essential APIs (Core Functionality)
These APIs are required for basic application functionality:

| Category | APIs | Count |
|----------|------|-------|
| Authentication | Login, Register, Me, Refresh, Logout | 5 |
| Users | List, Get, Update, Delete | 4 |
| Roles | List, Create, Get, Update, Delete | 5 |
| Permissions | List | 1 |
| Staff | List, Create, Get, Update, Delete, Search | 6 |
| Departments | List, Create, Get, Update, Delete | 5 |
| Attendance | List, Check-in, Check-out | 3 |
| Leave | List, Create, Approve, Reject, Balance | 5 |
| Performance | List, Create, Get | 3 |
| Projects | List, Create, Get, Update, Delete | 5 |
| Tasks | Get, Update, Create | 3 |
| Chat | List Rooms, Create Room, Get Messages, Send Message | 4 |
| Announcements | List, Create, Get, Acknowledge | 4 |
| Notifications | List, Unread Count, Mark Read | 3 |
| Clients | List, Create, Get, Update | 4 |
| Finance | List Expenses, List Budgets, List Payroll | 3 |
| Audit | List Logs | 1 |

**Total Essential APIs: ~60**

### Optional/Extended APIs
These add advanced functionality but aren't required for MVP:

| Category | APIs |
|----------|------|
| Staff | Documents, Org Chart |
| Projects | Members, Timeline, Budget, Sprints, Milestones |
| Tasks | Assign, Status Update, Time Logs |
| Sprints | Burndown, Start, Complete |
| Chat | Edit Message, Delete Message, Reactions, Search |
| Culture | Events, Trips, Polls, Recognitions |
| Clients | Contacts, Contracts, Proposals, Invoices |
| Finance | Salary Structures, Approve/Reject Expenses |
| Audit | Stats, Search, Export, Compliance Reports |

### Recommended for Removal
These APIs are either redundant, rarely used, or add unnecessary complexity:

1. **Pipeline Stages as separate endpoints** - Merge into Pipeline CRUD
2. **Automations** - Can be handled server-side
3. **Culture Gallery & Itinerary** - Overly specific
4. **Proposal endpoints** - Redundant with Contracts
5. **GDPR Export/Delete** - Can be manual admin operations
6. **Ticket Comments** - Simplify to basic tickets
7. **Salary Structures** - Merge into Payroll
8. **Budget Transactions** - Can be calculated from expenses

---

## Authentication

### POST /auth/login
**UI:** Login Screen

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "mfa_code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_at": "2026-04-27T12:00:00Z"
  }
}
```

---

### POST /auth/register
**UI:** Registration Screen

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "pending"
  }
}
```

---

### GET /auth/me
**UI:** User Profile, Navigation

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "roles": ["staff", "manager"],
    "mfa_enabled": false,
    "email_verified": true
  }
}
```

---

## User Management

### GET /users
**UI:** User Directory, Admin Panel

**Query Params:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "status": "active",
      "roles": ["staff"]
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 50 }
}
```

---

### GET /users/:id
**UI:** User Profile

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "avatar_url": "https://...",
    "status": "active",
    "roles": ["staff", "manager"],
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### PUT /users/:id
**UI:** Edit User Profile

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar_url": "https://..."
}
```

---

### POST /users/:id/roles
**UI:** Admin Panel - Role Assignment

**Request:**
```json
{
  "role_id": "uuid"
}
```

---

## Roles & Permissions

### GET /roles
**UI:** Role Management

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "manager",
      "description": "Department manager",
      "permissions": [
        { "resource": "staff", "action": "read", "scope": "department" }
      ]
    }
  ]
}
```

---

### POST /roles
**UI:** Create Role

**Request:**
```json
{
  "name": "team_lead",
  "description": "Team lead role",
  "permission_ids": ["uuid1", "uuid2"]
}
```

---

## Staff Management

### GET /staff
**UI:** Employee Directory, HR Dashboard

**Query Params:**
- `page`: Page number
- `limit`: Items per page
- `sort`: Sort field (default: `created_at DESC`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee_id": "EMP001",
      "user_id": "uuid",
      "department_id": "uuid",
      "manager_id": "EMP002",
      "hire_date": "2026-01-15T00:00:00Z",
      "job_title": "Software Engineer",
      "roles": [
        {
          "id": "uuid",
          "role_name": "Backend Developer",
          "is_primary": true
        }
      ],
      "employment_type": "full_time",
      "status": "active",
      "salary": 75000.00,
      "currency": "USD",
      "created_at": "2026-01-15T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 50 }
}
```

---

### POST /staff
**UI:** Add Employee, Onboarding

**Request:**
```json
{
  "user_id": "uuid",
  "department_id": "uuid",
  "manager_id": "uuid",
  "hire_date": "2026-01-15T00:00:00Z",
  "job_title": "Software Engineer",
  "roles": ["Backend Developer", "Tech Lead"],
  "employment_type": "full_time",
  "salary": 75000.00,
  "currency": "USD",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "postal_code": "10001",
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+1234567890"
}
```

**Note:** `employee_code` is auto-generated as `EMP001`, `EMP002`, etc. You don't need to provide it.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employee_id": "EMP001",
    "user_id": "uuid",
    "job_title": "Software Engineer",
    "roles": [
      {
        "id": "uuid",
        "role_name": "Backend Developer",
        "is_primary": true
      },
      {
        "id": "uuid",
        "role_name": "Tech Lead",
        "is_primary": false
      }
    ],
    "status": "active",
    "created_at": "2026-01-15T00:00:00Z"
  }
}
```

---

### GET /staff/:id
**UI:** Employee Profile

**Response:** Same as list item with full details

---

### PUT /staff/:id
**UI:** Edit Employee

**Request:**
```json
{
  "department_id": "uuid",
  "manager_id": "uuid",
  "job_title": "Senior Software Engineer",
  "roles": ["Senior Backend Developer"],
  "employment_type": "full_time",
  "salary": 90000.00,
  "status": "active"
}
```

---

### DELETE /staff/:id
**UI:** Terminate Employee

**Response:** 204 No Content

---

## Departments

### GET /departments
**UI:** Organization Chart, Department List

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Engineering",
      "code": "ENG",
      "parent_id": "uuid",
      "manager_id": "EMP001",
      "description": "Engineering department",
      "staff_count": 25
    }
  ]
}
```

---

### POST /departments
**UI:** Create Department

**Request:**
```json
{
  "name": "Engineering",
  "code": "ENG",
  "parent_id": "uuid",
  "manager_id": "uuid",
  "description": "Engineering and development"
}
```

**Note:** `code` must be unique.

---

## Attendance

### GET /attendance
**UI:** Attendance Dashboard

**Query Params:**
- `employee_id`: Filter by employee
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee_id": "EMP001",
      "date": "2026-04-27T00:00:00Z",
      "check_in": "2026-04-27T09:00:00Z",
      "check_out": "2026-04-27T18:00:00Z",
      "status": "present"
    }
  ]
}
```

---

### POST /attendance/check-in
**UI:** Employee Dashboard - Check In Button

**Request:**
```json
{
  "employee_id": "uuid",
  "notes": "Working from office"
}
```

---

### POST /attendance/check-out
**UI:** Employee Dashboard - Check Out Button

**Request:**
```json
{
  "employee_id": "uuid",
  "notes": ""
}
```

---

## Leave Management

### GET /leaves
**UI:** Leave Dashboard, Manager Approval Queue

**Query Params:**
- `status`: pending, approved, rejected

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee_id": "EMP001",
      "type": "annual",
      "start_date": "2026-05-01T00:00:00Z",
      "end_date": "2026-05-05T00:00:00Z",
      "reason": "Vacation",
      "status": "pending",
      "approved_by": null,
      "approved_at": null
    }
  ]
}
```

---

### POST /leaves
**UI:** Request Leave

**Request:**
```json
{
  "type": "annual",
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2026-05-05T00:00:00Z",
  "reason": "Vacation"
}
```

---

### PUT /leaves/:id/approve
**UI:** Manager Dashboard - Approve Leave

**Request:**
```json
{
  "approved_by": "uuid"
}
```

---

### PUT /leaves/:id/reject
**UI:** Manager Dashboard - Reject Leave

**Request:**
```json
{
  "rejection_reason": "Insufficient team coverage"
}
```

---

### GET /leaves/balance
**UI:** Employee Dashboard

**Query Params:**
- `type`: Leave type (optional, returns all if not specified)

**Response:**
```json
{
  "success": true,
  "data": [
    { "type": "annual", "balance": 15 },
    { "type": "sick", "balance": 8 }
  ]
}
```

---

## Performance Reviews

### GET /performance-reviews
**UI:** HR Dashboard, Manager Dashboard

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee_id": "EMP001",
      "reviewer_id": "EMP002",
      "review_period_start": "2026-01-01T00:00:00Z",
      "review_period_end": "2026-03-31T00:00:00Z",
      "goals": "Improve code quality",
      "achievements": "Shipped 3 major features",
      "rating": 4,
      "feedback": "Great performance",
      "status": "completed"
    }
  ]
}
```

---

### POST /performance-reviews
**UI:** Create Review

**Request:**
```json
{
  "employee_id": "uuid",
  "reviewer_id": "uuid",
  "review_period_start": "2026-01-01T00:00:00Z",
  "review_period_end": "2026-03-31T00:00:00Z",
  "goals": "Improve code quality",
  "rating": 4,
  "feedback": "Great performance"
}
```

---

## Projects

### GET /projects
**UI:** Project Dashboard

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Website Redesign",
      "description": "Redesign company website",
      "manager_id": "uuid",
      "priority": "high",
      "status": "active",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /projects
**UI:** Create Project

**Request:**
```json
{
  "name": "Website Redesign",
  "description": "Redesign company website",
  "manager_id": "uuid",
  "priority": "high",
  "status": "planning"
}
```

**Note:** `priority`: low, medium, high, critical. `status`: planning, active, on_hold, completed, cancelled.

---

### GET /projects/:id
**UI:** Project Detail

---

### PUT /projects/:id
**UI:** Edit Project

---

### GET /projects/:id/tasks
**UI:** Project Task Board

---

### POST /projects/:id/tasks
**UI:** Create Task

**Request:**
```json
{
  "title": "Design homepage",
  "description": "Create new homepage design",
  "assignee_id": "uuid",
  "priority": "high",
  "status": "todo",
  "due_date": "2026-05-01T00:00:00Z"
}
```

---

## Tasks

### GET /tasks/:id
**UI:** Task Detail

---

### PUT /tasks/:id
**UI:** Edit Task

---

## Chat

### GET /chat/rooms
**UI:** Chat Sidebar

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Engineering Team",
      "type": "group",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /chat/rooms
**UI:** Create Chat Room

**Request:**
```json
{
  "name": "Project Alpha",
  "type": "group",
  "member_ids": ["uuid1", "uuid2"]
}
```

---

### GET /chat/rooms/:id/messages
**UI:** Chat Window

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "room_id": "uuid",
      "sender_id": "uuid",
      "content": "Hello team!",
      "created_at": "2026-04-27T10:00:00Z"
    }
  ]
}
```

---

### POST /chat/rooms/:id/messages
**UI:** Chat Input

**Request:**
```json
{
  "content": "Hello team!"
}
```

---

## Announcements

### GET /announcements
**UI:** Announcement Feed, Dashboard

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Company Retreat",
      "content": "Join us for the annual retreat...",
      "type": "company",
      "priority": "high",
      "created_by": "uuid",
      "created_at": "2026-04-27T10:00:00Z"
    }
  ]
}
```

---

### POST /announcements
**UI:** Create Announcement (Admin/HR)

**Request:**
```json
{
  "title": "Company Retreat",
  "content": "Join us for the annual retreat...",
  "type": "company",
  "priority": "high"
}
```

**Note:** `type`: company, department, project. `priority`: low, normal, high, urgent.

---

### POST /announcements/:id/acknowledge
**UI:** Announcement Read Receipt

**Response:** 204 No Content

---

## Notifications

### GET /notifications
**UI:** Notification Bell/Dropdown

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "New task assigned",
      "message": "You have been assigned to Task #123",
      "type": "task",
      "read": false,
      "created_at": "2026-04-27T10:00:00Z"
    }
  ]
}
```

---

### GET /notifications/unread-count
**UI:** Notification Badge

**Response:**
```json
{
  "success": true,
  "data": { "count": 5 }
}
```

---

### PUT /notifications/:id/read
**UI:** Mark as Read

---

## Culture

### GET /culture/events
**UI:** Events Calendar

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Team Building",
      "description": "Outdoor activities",
      "type": "team_building",
      "start_date": "2026-05-01T09:00:00Z",
      "end_date": "2026-05-01T17:00:00Z",
      "location": "Central Park"
    }
  ]
}
```

---

### POST /culture/events
**UI:** Create Event

**Request:**
```json
{
  "title": "Team Building",
  "description": "Outdoor activities",
  "type": "team_building",
  "start_date": "2026-05-01T09:00:00Z",
  "end_date": "2026-05-01T17:00:00Z",
  "location": "Central Park",
  "organizer_id": "uuid"
}
```

---

## Clients & CRM

### GET /clients
**UI:** Client List

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+1234567890",
      "company": "Acme Corporation",
      "status": "active",
      "tax_id": "TAX123456"
    }
  ]
}
```

---

### POST /clients
**UI:** Add Client

**Request:**
```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "+1234567890",
  "company": "Acme Corporation",
  "status": "active",
  "tax_id": "TAX123456"
}
```

**Note:** `tax_id` must be unique.

---

## Finance

### GET /expenses
**UI:** Expense Dashboard

---

### POST /expenses
**UI:** Submit Expense

**Request:**
```json
{
  "category": "travel",
  "amount": 500.00,
  "currency": "USD",
  "description": "Client meeting travel",
  "date": "2026-04-27T00:00:00Z",
  "receipt_url": "https://..."
}
```

---

### GET /budgets
**UI:** Budget Dashboard

---

### GET /payroll
**UI:** Payroll Dashboard (Admin/HR)

---

## Audit & Compliance

### GET /audit-logs
**UI:** Audit Trail (Admin)

---

### GET /audit-logs/stats
**UI:** Admin Dashboard

---

## UI Screen Mapping

| UI Screen | APIs Used | Priority |
|-----------|-----------|----------|
| **Login** | POST /auth/login | Required |
| **Register** | POST /auth/register | Required |
| **Dashboard** | GET /auth/me, GET /notifications/unread-count, GET /announcements | Required |
| **Employee Directory** | GET /staff, GET /departments | Required |
| **Employee Profile** | GET /staff/:id, GET /users/:id | Required |
| **Add Employee** | POST /staff, POST /users/:id/roles | Required |
| **Edit Employee** | PUT /staff/:id | Required |
| **Organization Chart** | GET /staff, GET /departments | Optional |
| **Attendance** | GET /attendance, POST /attendance/check-in, POST /attendance/check-out | Required |
| **Leave Dashboard** | GET /leaves, GET /leaves/balance | Required |
| **Request Leave** | POST /leaves | Required |
| **Leave Approvals** | PUT /leaves/:id/approve, PUT /leaves/:id/reject | Required |
| **Performance Reviews** | GET /performance-reviews, POST /performance-reviews | Optional |
| **Project Dashboard** | GET /projects | Required |
| **Project Detail** | GET /projects/:id, GET /projects/:id/tasks | Required |
| **Create Project** | POST /projects | Required |
| **Task Board** | GET /projects/:id/tasks, PUT /tasks/:id | Required |
| **Chat** | GET /chat/rooms, GET /chat/rooms/:id/messages, POST /chat/rooms/:id/messages | Required |
| **Announcements** | GET /announcements, POST /announcements | Required |
| **Notifications** | GET /notifications, PUT /notifications/:id/read | Required |
| **Events** | GET /culture/events, POST /culture/events | Optional |
| **Client List** | GET /clients | Required |
| **Add Client** | POST /clients | Required |
| **Expense Dashboard** | GET /expenses, POST /expenses | Optional |
| **Budget Dashboard** | GET /budgets | Optional |
| **Payroll** | GET /payroll | Optional |
| **Admin Panel** | GET /users, GET /roles, GET /permissions, GET /audit-logs | Required |
| **Settings** | PUT /users/:id, PUT /users/:id/password | Required |

---

## Implementation Notes

### Employee ID Migration
- All new employees get auto-generated IDs: `EMP001`, `EMP002`, etc.
- Employee IDs are unique and sequential
- When creating an employee, do NOT send `employee_code` - it will be auto-generated
- Manager references use the same employee ID format

### Multiple Roles
- Employees can have multiple roles via the `roles` array
- First role in the array is marked as primary
- Roles are stored in the `staff.employee_roles` table
- Update roles by sending the complete `roles` array in PUT /staff/:id

### API Reduction Summary
**Removed/Recommended for Removal:**
1. `/pipelines/stages/*` - Merge into pipeline endpoints
2. `/automations/*` - Server-side only
3. `/culture/events/:id/gallery` - Overly specific
4. `/culture/trips/:id/itinerary` - Overly specific
5. `/proposals/*` - Redundant with contracts
6. `/compliance/gdpr/*` - Manual admin operations
7. `/tickets/:id/comments` - Simplify tickets
8. `/salary-structures/*` - Merge into payroll
9. `/budgets/:id/transactions` - Calculate from expenses

**Total API Reduction: ~25 endpoints removed**
**Remaining Essential APIs: ~75 endpoints**

### Date Format
All dates use RFC3339 format: `2026-04-27T10:00:00Z`

### Error Responses
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```
