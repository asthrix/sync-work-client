# SyncWork API Schemas - Complete Request/Response Reference

> **Companion Document:** [SYNC WORK API Integration Guide](./SYNC_WORK_API_INTEGRATION_GUIDE.md) - TanStack Query hooks and UI components

## Table of Contents
- [Base Response Wrappers](#base-response-wrappers)
- [1. Authentication](#1-authentication)
- [2. Users](#2-users)
- [3. Roles & Permissions (RBAC)](#3-roles--permissions-rbac)
- [4. Staff](#4-staff)
- [5. Departments](#5-departments)
- [6. Attendance](#6-attendance)
- [7. Leave](#7-leave)
- [8. Performance Reviews](#8-performance-reviews)
- [9. Projects](#9-projects)
- [10. Tasks](#10-tasks)
- [11. Sprints](#11-sprints)
- [12. Milestones](#12-milestones)
- [13. Pipelines (Boards)](#13-pipelines-boards)
- [14. Automations](#14-automations)
- [15. Chat](#15-chat)
- [16. Announcements](#16-announcements)
- [17. Notifications](#17-notifications)
- [18. Culture & Events](#18-culture--events)
- [19. Culture - Trips](#19-culture---trips)
- [20. Culture - Polls](#20-culture---polls)
- [21. Culture - Recognitions](#21-culture---recognitions)
- [22. Clients](#22-clients)
- [23. Contacts](#23-contacts)
- [24. Contracts](#24-contracts)
- [25. Proposals](#25-proposals)
- [26. Support Tickets](#26-support-tickets)
- [27. Finance - Payroll](#27-finance---payroll)
- [28. Finance - Salary Structures](#28-finance---salary-structures)
- [29. Finance - Expenses](#29-finance---expenses)
- [30. Finance - Budgets](#30-finance---budgets)
- [31. Audit & Compliance](#31-audit--compliance)
- [32. File Upload](#32-file-upload)
- [33. WebSocket](#33-websocket)
- [Common Patterns](#common-patterns)

---

## Base Response Wrappers

All API responses are wrapped in these structures:

### SuccessResponse
```json
{
  "success": true,
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z",
    "requestId": "req_abc123"
  }
}
```

### ErrorResponse
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ],
    "traceId": "trace_abc123"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

## 1. Authentication

### POST /auth/register
**Auth:** No  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```
**Required Fields:** `email`, `password`, `first_name`, `last_name`  
**Validation:** `email` (email format), `password` (min 8 chars), `first_name`/`last_name` (max 100 chars), `phone` (optional, max 20 chars)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "avatar_url": null,
    "status": "pending",
    "roles": ["staff"],
    "mfa_enabled": false,
    "email_verified": false,
    "last_login_at": null,
    "created_at": "2026-04-25T11:11:54Z",
    "updated_at": "2026-04-25T11:11:54Z"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /auth/login
**Auth:** No  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "mfa_code": "123456"
}
```
**Required Fields:** `email`, `password`  
**Optional:** `mfa_code` (only if MFA enabled)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_at": "2026-04-25T11:26:54Z"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /auth/me
**Auth:** BearerAuth  
**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK` -> `UserResponse` (same as register response)

---

### POST /auth/refresh
**Auth:** No  
**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Required Fields:** `refresh_token`

**Response:** `200 OK` -> `TokenResponse` (same as login)

---

### POST /auth/logout
**Auth:** BearerAuth

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /auth/password-reset
**Auth:** No  
**Request Body:**
```json
{
  "email": "user@example.com"
}
```
**Required Fields:** `email` (email format)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent if account exists"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /auth/password-reset/confirm
**Auth:** No  
**Request Body:**
```json
{
  "token": "reset_token_xyz",
  "new_password": "NewSecurePass123!"
}
```
**Required Fields:** `token`, `new_password` (min 8 chars)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

## 2. Users

### GET /users
**Auth:** BearerAuth  
**Query Parameters:**
- `page` (int, optional, default=1)
- `limit` (int, optional, default=20)
- `sort` (string, optional)
- `search` (string, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "avatar_url": "https://example.com/avatar.jpg",
      "status": "active",
      "roles": ["staff", "admin"],
      "mfa_enabled": false,
      "email_verified": true,
      "last_login_at": "2026-04-25T10:00:00Z",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /users/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `UserResponse`

---

### PUT /users/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "first_name": "Johnny",
  "last_name": "Doe",
  "phone": "+0987654321",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```
**All fields optional**  
**Validation:** `first_name`/`last_name` (max 100), `phone` (max 20), `avatar_url` (max 500)

**Response:** `200 OK` -> `UserResponse`

---

### DELETE /users/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### PUT /users/{id}/password
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass123!"
}
```
**Required Fields:** `current_password`, `new_password` (min 8 chars)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

## 3. Roles & Permissions (RBAC)

### POST /roles
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "name": "custom_role",
  "description": "A custom role for specific permissions",
  "permission_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```
**Required Fields:** `name` (max 100)  
**Optional:** `description` (max 255), `permission_ids` (array of UUIDs)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "custom_role",
    "description": "A custom role for specific permissions",
    "permissions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "resource": "project",
        "action": "read",
        "scope": "own",
        "description": "Read own projects"
      }
    ],
    "created_at": "2026-04-25T11:11:54Z"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /roles
**Auth:** BearerAuth

**Response:** `200 OK` -> Array of `RoleResponse`

---

### GET /roles/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `RoleResponse`

---

### PUT /roles/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "updated_role",
  "description": "Updated description",
  "permission_ids": [
    "550e8400-e29b-41d4-a716-446655440001"
  ]
}
```
**All fields optional**

**Response:** `200 OK` -> `RoleResponse`

---

### DELETE /roles/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### POST /users/{user_id}/roles
**Auth:** BearerAuth  
**Path Parameters:** `user_id` (string, UUID)  
**Request Body:**
```json
{
  "role_id": "550e8400-e29b-41d4-a716-446655440003"
}
```
**Required Fields:** `role_id` (UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Role assigned successfully"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### DELETE /users/{user_id}/roles/{role_id}
**Auth:** BearerAuth  
**Path Parameters:** `user_id` (string, UUID), `role_id` (string, UUID)

**Response:** `204 No Content`

---

### POST /permissions
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "resource": "project",
  "action": "delete",
  "scope": "all",
  "description": "Delete any project"
}
```
**Required Fields:** `resource` (max 100), `action` (max 50), `scope` (max 50)  
**Optional:** `description` (max 255)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "resource": "project",
    "action": "delete",
    "scope": "all",
    "description": "Delete any project"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /permissions
**Auth:** BearerAuth

**Response:** `200 OK` -> Array of `PermissionResponse`

---

## 4. Staff

### GET /staff
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `sort`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "employee_code": "EMP001",
      "department_id": "550e8400-e29b-41d4-a716-446655440006",
      "manager_id": null,
      "hire_date": "2026-01-15T00:00:00Z",
      "job_title": "Software Engineer",
      "employment_type": "full_time",
      "status": "active",
      "salary": 75000.00,
      "currency": "USD",
      "address": "123 Main St",
      "city": "New York",
      "country": "USA",
      "postal_code": "10001",
      "emergency_contact": "Jane Doe",
      "emergency_phone": "+1987654321",
      "birth_date": "1990-05-15T00:00:00Z",
      "probation_end_date": "2026-04-15T00:00:00Z",
      "termination_date": null,
      "notes": "Top performer",
      "created_at": "2026-01-15T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /staff
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_code": "EMP001",
  "department_id": "550e8400-e29b-41d4-a716-446655440006",
  "manager_id": null,
  "hire_date": "2026-01-15T00:00:00Z",
  "job_title": "Software Engineer",
  "employment_type": "full_time",
  "salary": 75000.00,
  "currency": "USD",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "postal_code": "10001",
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+1987654321",
  "birth_date": "1990-05-15T00:00:00Z",
  "probation_end_date": "2026-04-15T00:00:00Z",
  "notes": "New hire"
}
```
**Required Fields:** `user_id` (UUID), `employee_code` (max 50), `hire_date` (ISO 8601), `job_title` (max 200), `employment_type` (oneof: full_time, part_time, contract, intern, freelance)  
**Optional:** All other fields

**Response:** `201 Created` -> `EmployeeResponse`

---

### GET /staff/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `EmployeeResponse`

---

### PUT /staff/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "department_id": "550e8400-e29b-41d4-a716-446655440007",
  "manager_id": "550e8400-e29b-41d4-a716-446655440008",
  "job_title": "Senior Software Engineer",
  "employment_type": "full_time",
  "salary": 90000.00,
  "currency": "USD",
  "address": "456 Oak Ave",
  "city": "Boston",
  "country": "USA",
  "postal_code": "02101",
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+1987654321",
  "birth_date": "1990-05-15T00:00:00Z",
  "probation_end_date": null,
  "notes": "Promoted to senior"
}
```
**All fields optional**  
**Validation:** Same as create

**Response:** `200 OK` -> `EmployeeResponse`

---

### DELETE /staff/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### GET /staff/search
**Auth:** BearerAuth  
**Query Parameters:** `q` (string, required), `page`, `limit`

**Response:** `200 OK` -> Array of `EmployeeResponse` (paginated)

---

### GET /staff/org-chart
**Auth:** BearerAuth

**Response:** `200 OK` -> Array of `EmployeeResponse`

---

### GET /staff/{id}/documents
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440009",
      "employee_id": "550e8400-e29b-41d4-a716-446655440005",
      "type": "contract",
      "name": "Employment Contract",
      "file_url": "https://storage.example.com/docs/contract.pdf",
      "expiry_date": "2027-01-15T00:00:00Z",
      "status": "active",
      "notes": "Signed on 2026-01-15",
      "created_at": "2026-01-15T00:00:00Z",
      "updated_at": "2026-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /staff/{id}/documents
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "type": "certificate",
  "name": "AWS Certification",
  "file_url": "https://storage.example.com/docs/aws-cert.pdf",
  "expiry_date": "2028-04-25T00:00:00Z",
  "notes": "AWS Solutions Architect"
}
```
**Required Fields:** `type` (oneof: id, passport, visa, contract, certificate, medical, other), `name` (max 255), `file_url` (max 500, URL format)  
**Optional:** `expiry_date`, `notes`

**Response:** `201 Created` -> `DocumentResponse`

---

## 5. Departments

### GET /departments
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "name": "Engineering",
      "code": "ENG",
      "parent_id": null,
      "manager_id": "550e8400-e29b-41d4-a716-446655440000",
      "description": "Software Engineering Department",
      "staff_count": 25,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /departments
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "name": "Engineering",
  "code": "ENG",
  "parent_id": null,
  "manager_id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Software Engineering Department"
}
```
**Required Fields:** `name` (max 200), `code` (max 50)  
**Optional:** `parent_id` (UUID), `manager_id` (UUID), `description` (max 500)

**Response:** `201 Created` -> `DepartmentResponse`

---

### GET /departments/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `DepartmentResponse`

---

### PUT /departments/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Engineering & Product",
  "code": "ENG-PROD",
  "parent_id": null,
  "manager_id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Engineering and Product Department"
}
```
**All fields optional**

**Response:** `200 OK` -> `DepartmentResponse`

---

### DELETE /departments/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### GET /departments/{id}/staff
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK` -> Array of `EmployeeResponse` (paginated)

---

## 6. Attendance

### GET /attendance
**Auth:** BearerAuth  
**Query Parameters:** `employee_id`, `start_date`, `end_date`, `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "employee_id": "550e8400-e29b-41d4-a716-446655440005",
      "date": "2026-04-25T00:00:00Z",
      "check_in": "2026-04-25T09:00:00Z",
      "check_out": "2026-04-25T18:00:00Z",
      "status": "present",
      "notes": null,
      "created_at": "2026-04-25T09:00:00Z",
      "updated_at": "2026-04-25T18:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 30,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /attendance/check-in
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "employee_id": "550e8400-e29b-41d4-a716-446655440005",
  "notes": "Working from office"
}
```
**Required Fields:** `employee_id` (UUID)  
**Optional:** `notes`

**Response:** `201 Created` -> `AttendanceResponse`

---

### POST /attendance/check-out
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "employee_id": "550e8400-e29b-41d4-a716-446655440005",
  "notes": "Completed all tasks"
}
```
**Required Fields:** `employee_id` (UUID)  
**Optional:** `notes`

**Response:** `200 OK` -> `AttendanceResponse`

---

### GET /attendance/reports
**Auth:** BearerAuth  
**Query Parameters:** `start_date` (required), `end_date` (required), `employee_id`

**Response:** `200 OK` -> Array of `AttendanceResponse`

---

### GET /attendance/my
**Auth:** BearerAuth

**Response:** `200 OK` -> Array of `AttendanceResponse`

---

## 7. Leave

### GET /leaves
**Auth:** BearerAuth  
**Query Parameters:** `status`, `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "employee_id": "550e8400-e29b-41d4-a716-446655440005",
      "type": "annual",
      "start_date": "2026-05-01T00:00:00Z",
      "end_date": "2026-05-05T00:00:00Z",
      "reason": "Family vacation",
      "status": "pending",
      "approved_by": null,
      "approved_at": null,
      "rejection_reason": null,
      "created_at": "2026-04-25T11:11:54Z",
      "updated_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /leaves
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "type": "annual",
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2026-05-05T00:00:00Z",
  "reason": "Family vacation"
}
```
**Required Fields:** `type` (oneof: annual, sick, maternity, paternity, unpaid, bereavement, study, other), `start_date`, `end_date`  
**Optional:** `reason`

**Response:** `201 Created` -> `LeaveRequestResponse`

---

### GET /leaves/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `LeaveRequestResponse`

---

### PUT /leaves/{id}/approve
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "approved_by": "550e8400-e29b-41d4-a716-446655440000"
}
```
**Required Fields:** `approved_by` (UUID)

**Response:** `200 OK` -> `LeaveRequestResponse`

---

### PUT /leaves/{id}/reject
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "rejection_reason": "Too many team members on leave"
}
```
**Required Fields:** `rejection_reason`

**Response:** `200 OK` -> `LeaveRequestResponse`

---

### GET /leaves/balance
**Auth:** BearerAuth  
**Query Parameters:** `type` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "type": "annual",
      "balance": 15
    },
    {
      "type": "sick",
      "balance": 10
    }
  ],
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /leaves/types
**Auth:** BearerAuth

**Response:** `200 OK`
```json
{
  "success": true,
  "data": ["annual", "sick", "maternity", "paternity", "unpaid", "bereavement", "study", "other"],
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

## 8. Performance Reviews

### GET /performance-reviews
**Auth:** BearerAuth  
**Query Parameters:** `status`, `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440012",
      "employee_id": "550e8400-e29b-41d4-a716-446655440005",
      "reviewer_id": "550e8400-e29b-41d4-a716-446655440000",
      "review_period_start": "2026-01-01T00:00:00Z",
      "review_period_end": "2026-03-31T00:00:00Z",
      "goals": "Complete project X, Learn React",
      "achievements": "Completed project X ahead of schedule",
      "rating": 4,
      "feedback": "Excellent performance",
      "status": "reviewed",
      "created_at": "2026-04-01T00:00:00Z",
      "updated_at": "2026-04-10T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /performance-reviews
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "employee_id": "550e8400-e29b-41d4-a716-446655440005",
  "reviewer_id": "550e8400-e29b-41d4-a716-446655440000",
  "review_period_start": "2026-01-01T00:00:00Z",
  "review_period_end": "2026-03-31T00:00:00Z",
  "goals": "Complete project X, Learn React",
  "achievements": "",
  "rating": null,
  "feedback": ""
}
```
**Required Fields:** `employee_id` (UUID), `reviewer_id` (UUID), `review_period_start`, `review_period_end`  
**Optional:** `goals`, `achievements`, `rating` (1-5), `feedback`

**Response:** `201 Created` -> `PerformanceReviewResponse`

---

### GET /performance-reviews/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `PerformanceReviewResponse`

---

### PUT /performance-reviews/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "goals": "Complete project X, Learn React, Mentor junior dev",
  "achievements": "Completed project X ahead of schedule",
  "rating": 5,
  "feedback": "Outstanding performance",
  "status": "completed"
}
```
**All fields optional**  
**Validation:** `rating` (gte=1, lte=5), `status` (oneof: draft, submitted, reviewed, completed)

**Response:** `200 OK` -> `PerformanceReviewResponse`

---

## 9. Projects

### GET /projects
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `sort`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440013",
      "name": "Website Redesign",
      "description": "Redesign company website",
      "client_id": "550e8400-e29b-41d4-a716-446655440014",
      "manager_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "active",
      "priority": "high",
      "start_date": "2026-01-01T00:00:00Z",
      "end_date": "2026-06-30T00:00:00Z",
      "budget": 50000.00,
      "pipeline_id": "550e8400-e29b-41d4-a716-446655440015",
      "tags": ["web", "design"],
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /projects
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "name": "Mobile App",
  "description": "Build iOS and Android app",
  "client_id": "550e8400-e29b-41d4-a716-446655440014",
  "manager_id": "550e8400-e29b-41d4-a716-446655440000",
  "priority": "medium",
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2026-12-31T00:00:00Z",
  "budget": 100000.00,
  "tags": ["mobile", "ios", "android"]
}
```
**Required Fields:** `name` (max 255), `manager_id` (UUID)  
**Optional:** `description`, `client_id` (UUID), `priority` (oneof: low, medium, high, critical), `start_date`, `end_date`, `budget` (gte=0), `tags`

**Response:** `201 Created` -> `ProjectResponse`

---

### GET /projects/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `ProjectResponse`

---

### PUT /projects/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Mobile App v2",
  "description": "Build iOS and Android app with new features",
  "client_id": "550e8400-e29b-41d4-a716-446655440014",
  "manager_id": "550e8400-e29b-41d4-a716-446655440000",
  "priority": "high",
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2026-12-31T00:00:00Z",
  "budget": 150000.00,
  "tags": ["mobile", "ios", "android", "v2"]
}
```
**All fields optional**

**Response:** `200 OK` -> `ProjectResponse`

---

### DELETE /projects/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### GET /projects/{id}/members
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440016",
      "project_id": "550e8400-e29b-41d4-a716-446655440013",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "owner",
      "joined_at": "2026-01-01T00:00:00Z",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /projects/{id}/members
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "developer"
}
```
**Required Fields:** `user_id` (UUID), `role` (oneof: owner, manager, developer, viewer)

**Response:** `201 Created` -> `ProjectMemberResponse`

---

### DELETE /projects/{id}/members/{userId}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID), `userId` (string, UUID)

**Response:** `204 No Content`

---

### GET /projects/{id}/timeline
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "project_id": "550e8400-e29b-41d4-a716-446655440013",
    "project_name": "Website Redesign",
    "start_date": "2026-01-01T00:00:00Z",
    "end_date": "2026-06-30T00:00:00Z",
    "milestones": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440017",
        "project_id": "550e8400-e29b-41d4-a716-446655440013",
        "name": "Design Complete",
        "description": "Finish all designs",
        "due_date": "2026-02-28T00:00:00Z",
        "status": "achieved",
        "deliverables": ["UI designs", "UX flows"],
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-02-28T00:00:00Z"
      }
    ],
    "sprints": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440018",
        "project_id": "550e8400-e29b-41d4-a716-446655440013",
        "name": "Sprint 1",
        "goal": "Setup project",
        "start_date": "2026-01-01T00:00:00Z",
        "end_date": "2026-01-14T00:00:00Z",
        "status": "completed",
        "velocity": 25.5,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-14T00:00:00Z"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /projects/{id}/budget
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "project_id": "550e8400-e29b-41d4-a716-446655440013",
    "budget": 50000.00,
    "total_hours": 450.5,
    "hourly_rate": 100.00,
    "spent": 35000.00,
    "remaining": 15000.00
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /projects/templates
**Auth:** BearerAuth

**Response:** `200 OK` -> Array of `ProjectResponse`

---

## 10. Tasks

### GET /projects/{id}/tasks
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440019",
      "project_id": "550e8400-e29b-41d4-a716-446655440013",
      "title": "Design homepage",
      "description": "Create homepage design",
      "assignee_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2026-05-01T00:00:00Z",
      "estimated_hours": 16.0,
      "actual_hours": 8.5,
      "parent_id": null,
      "stage_id": "550e8400-e29b-41d4-a716-446655440020",
      "created_at": "2026-04-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /projects/{id}/tasks
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "title": "Implement auth",
  "description": "Add JWT authentication",
  "assignee_id": "550e8400-e29b-41d4-a716-446655440000",
  "priority": "high",
  "due_date": "2026-05-15T00:00:00Z",
  "estimated_hours": 24.0,
  "parent_id": null,
  "stage_id": "550e8400-e29b-41d4-a716-446655440020"
}
```
**Required Fields:** `title` (max 255)  
**Optional:** `description`, `assignee_id` (UUID), `priority` (oneof: low, medium, high, critical), `due_date`, `estimated_hours` (gte=0), `parent_id` (UUID), `stage_id` (UUID)

**Response:** `201 Created` -> `TaskResponse`

---

### GET /tasks/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `TaskResponse`

---

### PUT /tasks/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "title": "Implement auth and roles",
  "description": "Add JWT authentication and RBAC",
  "priority": "critical",
  "due_date": "2026-05-10T00:00:00Z",
  "estimated_hours": 32.0,
  "parent_id": null,
  "stage_id": "550e8400-e29b-41d4-a716-446655440020"
}
```
**All fields optional**

**Response:** `200 OK` -> `TaskResponse`

---

### DELETE /tasks/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### POST /tasks/{id}/assign
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "assignee_id": "550e8400-e29b-41d4-a716-446655440000"
}
```
**Required Fields:** `assignee_id` (UUID)

**Response:** `200 OK` -> `TaskResponse`

---

### POST /tasks/{id}/status
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "status": "done"
}
```
**Required Fields:** `status` (oneof: todo, in_progress, review, done, blocked)

**Response:** `200 OK` -> `TaskResponse`

---

### GET /tasks/{id}/time-logs
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440021",
      "task_id": "550e8400-e29b-41d4-a716-446655440019",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "hours": 4.5,
      "description": "Working on auth flow",
      "logged_at": "2026-04-25T09:00:00Z",
      "created_at": "2026-04-25T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /tasks/{id}/time-logs
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "hours": 3.5,
  "description": "Testing auth endpoints",
  "logged_at": "2026-04-25T14:00:00Z"
}
```
**Required Fields:** `hours` (gte=0), `logged_at` (ISO 8601)  
**Optional:** `description`

**Response:** `201 Created` -> `TimeLogResponse`

---

## 11. Sprints

### GET /projects/{id}/sprints
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK` -> Array of `SprintResponse`

**SprintResponse:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440018",
  "project_id": "550e8400-e29b-41d4-a716-446655440013",
  "name": "Sprint 1",
  "goal": "Setup project infrastructure",
  "start_date": "2026-01-01T00:00:00Z",
  "end_date": "2026-01-14T00:00:00Z",
  "status": "completed",
  "velocity": 25.5,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-14T00:00:00Z"
}
```

---

### POST /projects/{id}/sprints
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Sprint 2",
  "goal": "Implement core features",
  "start_date": "2026-01-15T00:00:00Z",
  "end_date": "2026-01-28T00:00:00Z"
}
```
**Required Fields:** `name` (max 255), `start_date`, `end_date`  
**Optional:** `goal`

**Response:** `201 Created` -> `SprintResponse`

---

### GET /sprints/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `SprintResponse`

---

### PUT /sprints/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Sprint 2 - Extended",
  "goal": "Implement core features and tests",
  "start_date": "2026-01-15T00:00:00Z",
  "end_date": "2026-02-04T00:00:00Z",
  "velocity": 30.0
}
```
**All fields optional**  
**Validation:** `velocity` (gte=0)

**Response:** `200 OK` -> `SprintResponse`

---

### DELETE /sprints/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### POST /sprints/{id}/start
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `SprintResponse`

---

### POST /sprints/{id}/complete
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `SprintResponse`

---

### GET /sprints/{id}/burndown
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sprint_id": "550e8400-e29b-41d4-a716-446655440018",
    "sprint_name": "Sprint 1",
    "data": [
      {
        "date": "2026-01-01T00:00:00Z",
        "ideal": 50.0,
        "actual": 50.0
      },
      {
        "date": "2026-01-07T00:00:00Z",
        "ideal": 25.0,
        "actual": 28.0
      },
      {
        "date": "2026-01-14T00:00:00Z",
        "ideal": 0.0,
        "actual": 2.0
      }
    ]
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

## 12. Milestones

### GET /projects/{id}/milestones
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK` -> Array of `MilestoneResponse`

**MilestoneResponse:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440017",
  "project_id": "550e8400-e29b-41d4-a716-446655440013",
  "name": "Design Complete",
  "description": "Finish all UI/UX designs",
  "due_date": "2026-02-28T00:00:00Z",
  "status": "achieved",
  "deliverables": ["UI designs", "UX flows", "Design system"],
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-02-28T00:00:00Z"
}
```

---

### POST /projects/{id}/milestones
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "MVP Launch",
  "description": "Launch minimum viable product",
  "due_date": "2026-06-30T00:00:00Z",
  "deliverables": ["Working app", "Documentation"]
}
```
**Required Fields:** `name` (max 255), `due_date` (ISO 8601)  
**Optional:** `description`, `deliverables` (array of strings)

**Response:** `201 Created` -> `MilestoneResponse`

---

### GET /milestones/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `MilestoneResponse`

---

### PUT /milestones/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "MVP Launch - Extended",
  "description": "Launch minimum viable product with extra features",
  "due_date": "2026-07-15T00:00:00Z",
  "status": "in_progress",
  "deliverables": ["Working app", "Documentation", "Tests"]
}
```
**All fields optional**  
**Validation:** `status` (oneof: pending, in_progress, achieved, missed)

**Response:** `200 OK` -> `MilestoneResponse`

---

### DELETE /milestones/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

## 13. Pipelines (Boards)

### GET /pipelines
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440015",
      "name": "Development Board",
      "project_id": "550e8400-e29b-41d4-a716-446655440013",
      "description": "Main development kanban board",
      "is_template": false,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /pipelines
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "name": "Bug Tracking",
  "project_id": "550e8400-e29b-41d4-a716-446655440013",
  "description": "Board for tracking bugs",
  "is_template": false
}
```
**Required Fields:** `name` (max 255)  
**Optional:** `project_id` (UUID), `description`, `is_template`

**Response:** `201 Created` -> `BoardResponse`

---

### GET /pipelines/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `BoardResponse`

---

### PUT /pipelines/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Bug Tracking - Updated",
  "description": "Updated board for tracking bugs"
}
```
**All fields optional**

**Response:** `200 OK` -> `BoardResponse`

---

### DELETE /pipelines/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### GET /pipelines/{id}/stages
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "board_id": "550e8400-e29b-41d4-a716-446655440015",
      "name": "To Do",
      "order": 0,
      "wip_limit": null,
      "description": "Tasks to be started",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440022",
      "board_id": "550e8400-e29b-41d4-a716-446655440015",
      "name": "In Progress",
      "order": 1,
      "wip_limit": 5,
      "description": "Tasks currently being worked on",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /pipelines/{id}/stages
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Review",
  "order": 2,
  "wip_limit": 3,
  "description": "Tasks under review"
}
```
**Required Fields:** `name` (max 255), `order` (gte=0)  
**Optional:** `wip_limit` (gte=0), `description`

**Response:** `201 Created` -> `StageResponse`

---

### PUT /pipelines/stages/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Code Review",
  "order": 2,
  "wip_limit": 4,
  "description": "Tasks in code review"
}
```
**All fields optional**  
**Validation:** `order` (gte=0), `wip_limit` (gte=0)

**Response:** `200 OK` -> `StageResponse`

---

### DELETE /pipelines/stages/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### POST /pipelines/{id}/move-task
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440019",
  "stage_id": "550e8400-e29b-41d4-a716-446655440022",
  "position": 1
}
```
**Required Fields:** `task_id` (UUID), `stage_id` (UUID)  
**Optional:** `position`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Task moved successfully"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

## 14. Automations

### GET /pipelines/{id}/automations
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440023",
      "board_id": "550e8400-e29b-41d4-a716-446655440015",
      "name": "Auto-assign new tasks",
      "trigger": "task_created",
      "action": "assign_user",
      "conditions": {
        "stage": "todo"
      },
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /pipelines/{id}/automations
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Notify on completion",
  "trigger": "task_completed",
  "action": "notify",
  "conditions": {
    "priority": "high"
  }
}
```
**Required Fields:** `name` (max 255), `trigger` (oneof: task_moved, task_created, task_completed, due_date), `action` (oneof: assign_user, set_label, notify, move_stage, set_priority)  
**Optional:** `conditions` (object)

**Response:** `201 Created` -> `AutomationResponse`

---

### GET /automations/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `AutomationResponse`

---

### PUT /automations/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Notify on completion - Updated",
  "trigger": "task_completed",
  "action": "notify",
  "conditions": {
    "priority": "critical"
  },
  "is_active": false
}
```
**All fields optional**

**Response:** `200 OK` -> `AutomationResponse`

---

### DELETE /automations/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

## 15. Chat

### GET /chat/rooms
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440024",
      "name": "General",
      "type": "group",
      "project_id": null,
      "created_by": "550e8400-e29b-41d4-a716-446655440000",
      "member_count": 25,
      "unread_count": 5,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /chat/rooms
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "name": "Project Alpha Team",
  "type": "group",
  "project_id": "550e8400-e29b-41d4-a716-446655440013",
  "member_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440005"
  ]
}
```
**Required Fields:** `name` (max 255), `type` (oneof: direct, group, project)  
**Optional:** `project_id` (UUID), `member_ids` (array of UUIDs)

**Response:** `201 Created` -> `RoomResponse`

---

### GET /chat/rooms/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `RoomResponse`

---

### PUT /chat/rooms/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Project Alpha Team - Updated"
}
```
**All fields optional**

**Response:** `200 OK` -> `RoomResponse`

---

### DELETE /chat/rooms/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### POST /chat/rooms/{id}/join
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### POST /chat/rooms/{id}/leave
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### GET /chat/rooms/{id}/messages
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440025",
      "room_id": "550e8400-e29b-41d4-a716-446655440024",
      "sender_id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Hello team!",
      "type": "text",
      "parent_id": null,
      "edited_at": null,
      "reactions": [
        {
          "emoji": "👍",
          "user_id": "550e8400-e29b-41d4-a716-446655440005",
          "created_at": "2026-04-25T11:12:00Z"
        }
      ],
      "created_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 500,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /chat/rooms/{id}/messages
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "content": "Great work everyone!",
  "type": "text",
  "parent_id": null
}
```
**Required Fields:** `content`  
**Optional:** `type` (oneof: text, file, system), `parent_id` (UUID)

**Response:** `201 Created` -> `MessageResponse`

---

### GET /chat/rooms/{id}/messages/{messageId}/thread
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID), `messageId` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK` -> Array of `MessageResponse` (paginated)

---

### PUT /chat/messages/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "content": "Updated message content"
}
```
**Required Fields:** `content`

**Response:** `200 OK` -> `MessageResponse`

---

### DELETE /chat/messages/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### POST /chat/messages/{id}/reactions
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "emoji": "🎉"
}
```
**Required Fields:** `emoji`

**Response:** `204 No Content`

---

### GET /chat/search
**Auth:** BearerAuth  
**Query Parameters:** `room_id` (required, UUID), `q` (required), `page`, `limit`

**Response:** `200 OK` -> Array of `MessageResponse` (paginated)

---

### POST /chat/rooms/{id}/read
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

## 16. Announcements

### GET /announcements
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `sort`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440026",
      "title": "Company Retreat",
      "content": "We are organizing a company retreat...",
      "type": "company",
      "scope_id": null,
      "priority": "high",
      "published_by": "550e8400-e29b-41d4-a716-446655440000",
      "published_at": "2026-04-25T10:00:00Z",
      "expires_at": null,
      "is_pinned": true,
      "acknowledged_count": 45,
      "is_acknowledged": true,
      "created_at": "2026-04-25T10:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /announcements
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "title": "New Office Opening",
  "content": "We are opening a new office in Boston...",
  "type": "company",
  "scope_id": null,
  "priority": "normal",
  "expires_at": "2026-05-25T00:00:00Z",
  "is_pinned": false
}
```
**Required Fields:** `title` (max 255), `content`, `type` (oneof: company, department, project)  
**Optional:** `scope_id` (UUID), `priority` (oneof: low, normal, high, urgent), `expires_at`, `is_pinned`

**Response:** `201 Created` -> `AnnouncementResponse`

---

### GET /announcements/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `AnnouncementResponse`

---

### PUT /announcements/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "title": "New Office Opening - Updated",
  "content": "We are opening a new office in Boston on June 1st...",
  "priority": "high",
  "expires_at": "2026-06-25T00:00:00Z",
  "is_pinned": true
}
```
**All fields optional**

**Response:** `200 OK` -> `AnnouncementResponse`

---

### DELETE /announcements/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### POST /announcements/{id}/pin
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `AnnouncementResponse`

---

### POST /announcements/{id}/acknowledge
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### GET /announcements/{id}/acknowledgements
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440027",
      "announcement_id": "550e8400-e29b-41d4-a716-446655440026",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "acknowledged_at": "2026-04-25T11:11:54Z",
      "created_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

## 17. Notifications

### GET /notifications
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440028",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "task_assigned",
      "title": "New task assigned",
      "content": "You have been assigned to 'Design homepage'",
      "data": {
        "task_id": "550e8400-e29b-41d4-a716-446655440019"
      },
      "is_read": false,
      "read_at": null,
      "created_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /notifications/unread-count
**Auth:** BearerAuth

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "count": 15
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### PUT /notifications/{id}/read
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### PUT /notifications/read-all
**Auth:** BearerAuth

**Response:** `204 No Content`

---

### DELETE /notifications/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### GET /notifications/preferences
**Auth:** BearerAuth

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440029",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email_enabled": true,
    "push_enabled": true,
    "chat_notifications": true,
    "announcement_notifications": true,
    "task_notifications": true,
    "project_notifications": true,
    "mention_notifications": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-04-25T10:00:00Z"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### PUT /notifications/preferences
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "email_enabled": false,
  "push_enabled": true,
  "chat_notifications": true,
  "announcement_notifications": false,
  "task_notifications": true,
  "project_notifications": true,
  "mention_notifications": true
}
```
**All fields optional**

**Response:** `200 OK` -> `NotificationPreferenceResponse`

---

## 18. Culture & Events

### GET /culture/events
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `status`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "title": "Hackathon 2026",
      "description": "Annual company hackathon",
      "type": "hackathon",
      "start_date": "2026-06-15T09:00:00Z",
      "end_date": "2026-06-16T18:00:00Z",
      "location": "Main Office",
      "max_participants": 50,
      "organizer_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "published",
      "banner_url": "https://example.com/hackathon-banner.jpg",
      "created_at": "2026-04-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /culture/events
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "title": "Team Building",
  "description": "Outdoor team building activities",
  "type": "team_building",
  "start_date": "2026-07-01T09:00:00Z",
  "end_date": "2026-07-01T17:00:00Z",
  "location": "Central Park",
  "max_participants": 30,
  "organizer_id": "550e8400-e29b-41d4-a716-446655440000",
  "banner_url": "https://example.com/team-building-banner.jpg"
}
```
**Required Fields:** `title` (max 255), `type` (oneof: hackathon, game_night, team_building, party), `start_date`, `end_date`, `organizer_id` (UUID)  
**Optional:** `description`, `location` (max 500), `max_participants` (gte=0), `banner_url` (max 500, URL)

**Response:** `201 Created` -> `EventResponse`

---

### GET /culture/events/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `EventResponse`

---

### PUT /culture/events/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "title": "Team Building - Updated",
  "description": "Outdoor team building activities - Rain or shine",
  "type": "team_building",
  "start_date": "2026-07-01T09:00:00Z",
  "end_date": "2026-07-01T17:00:00Z",
  "location": "Central Park - Pavilion 3",
  "max_participants": 35,
  "status": "published",
  "banner_url": "https://example.com/team-building-banner-v2.jpg"
}
```
**All fields optional**  
**Validation:** `type` (oneof: hackathon, game_night, team_building, party), `status` (oneof: draft, published, ongoing, completed, cancelled)

**Response:** `200 OK` -> `EventResponse`

---

### DELETE /culture/events/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### GET /culture/events/{id}/participants
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440031",
      "event_id": "550e8400-e29b-41d4-a716-446655440030",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "registered_at": "2026-04-25T11:11:54Z",
      "attended": false,
      "feedback": null,
      "created_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /culture/events/{id}/register
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```
**Required Fields:** `user_id` (UUID)

**Response:** `201 Created` -> `EventParticipantResponse`

---

### DELETE /culture/events/{id}/register/{user_id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID), `user_id` (string, UUID)

**Response:** `204 No Content`

---

### GET /culture/events/{id}/gallery
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440032",
      "event_id": "550e8400-e29b-41d4-a716-446655440030",
      "image_url": "https://example.com/gallery/photo1.jpg",
      "caption": "Team photo",
      "uploaded_by": "550e8400-e29b-41d4-a716-446655440000",
      "uploaded_at": "2026-04-25T11:11:54Z",
      "created_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /culture/events/{id}/gallery
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "image_url": "https://example.com/gallery/photo2.jpg",
  "caption": "Award ceremony",
  "uploaded_by": "550e8400-e29b-41d4-a716-446655440000"
}
```
**Required Fields:** `image_url` (max 500, URL), `uploaded_by` (UUID)  
**Optional:** `caption` (max 500)

**Response:** `201 Created` -> `EventGalleryItemResponse`

---

## 19. Culture - Trips

### GET /culture/trips
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `status`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440033",
      "destination": "Bali, Indonesia",
      "description": "Company trip to Bali",
      "start_date": "2026-08-01T00:00:00Z",
      "end_date": "2026-08-07T00:00:00Z",
      "cost_per_person": 2000.00,
      "max_participants": 20,
      "organizer_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "published",
      "banner_url": "https://example.com/bali-trip-banner.jpg",
      "created_at": "2026-04-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /culture/trips
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "destination": "Tokyo, Japan",
  "description": "Company trip to Tokyo",
  "start_date": "2026-09-01T00:00:00Z",
  "end_date": "2026-09-10T00:00:00Z",
  "cost_per_person": 3000.00,
  "max_participants": 15,
  "organizer_id": "550e8400-e29b-41d4-a716-446655440000",
  "banner_url": "https://example.com/tokyo-trip-banner.jpg"
}
```
**Required Fields:** `destination` (max 255), `start_date`, `end_date`, `organizer_id` (UUID)  
**Optional:** `description`, `cost_per_person` (gte=0), `max_participants` (gte=0), `banner_url` (max 500, URL)

**Response:** `201 Created` -> `TripResponse`

---

### GET /culture/trips/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `TripResponse`

---

### PUT /culture/trips/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "destination": "Tokyo, Japan - Extended",
  "description": "Company trip to Tokyo with extra activities",
  "start_date": "2026-09-01T00:00:00Z",
  "end_date": "2026-09-12T00:00:00Z",
  "cost_per_person": 3500.00,
  "max_participants": 20,
  "status": "published",
  "banner_url": "https://example.com/tokyo-trip-banner-v2.jpg"
}
```
**All fields optional**  
**Validation:** `status` (oneof: draft, published, ongoing, completed, cancelled)

**Response:** `200 OK` -> `TripResponse`

---

### DELETE /culture/trips/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### GET /culture/trips/{id}/participants
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440034",
      "trip_id": "550e8400-e29b-41d4-a716-446655440033",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "registered_at": "2026-04-25T11:11:54Z",
      "paid": true,
      "payment_status": "completed",
      "created_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /culture/trips/{id}/register
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```
**Required Fields:** `user_id` (UUID)

**Response:** `201 Created` -> `TripParticipantResponse`

---

### GET /culture/trips/{id}/itinerary
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440035",
      "trip_id": "550e8400-e29b-41d4-a716-446655440033",
      "day": 1,
      "title": "Arrival",
      "description": "Arrive in Bali, check into hotel",
      "time": "14:00",
      "location": "Ngurah Rai Airport",
      "created_at": "2026-04-01T00:00:00Z",
      "updated_at": "2026-04-01T00:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /culture/trips/{id}/itinerary
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "day": 2,
  "title": "Beach Day",
  "description": "Relax at the beach",
  "time": "10:00",
  "location": "Kuta Beach"
}
```
**Required Fields:** `day` (gte=1), `title` (max 255)  
**Optional:** `description`, `time` (max 50), `location` (max 500)

**Response:** `201 Created` -> `TripItineraryItemResponse`

---

## 20. Culture - Polls

### GET /culture/polls
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `status`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440036",
      "title": "Best programming language?",
      "description": "Vote for your favorite language",
      "type": "single_choice",
      "end_date": "2026-05-25T00:00:00Z",
      "created_by": "550e8400-e29b-41d4-a716-446655440000",
      "status": "active",
      "created_at": "2026-04-25T11:11:54Z",
      "updated_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /culture/polls
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "title": "Favorite framework?",
  "description": "Which framework do you prefer?",
  "type": "single_choice",
  "end_date": "2026-05-25T00:00:00Z",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "options": [
    {
      "text": "React",
      "order": 0
    },
    {
      "text": "Vue",
      "order": 1
    },
    {
      "text": "Angular",
      "order": 2
    }
  ]
}
```
**Required Fields:** `title` (max 255), `type` (oneof: single_choice, multiple_choice, rating), `created_by` (UUID), `options` (min 2)  
**Optional:** `description`, `end_date`

**Response:** `201 Created` -> `PollResponse`

---

### GET /culture/polls/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `PollResponse`

---

### GET /culture/polls/{id}/options
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440037",
      "poll_id": "550e8400-e29b-41d4-a716-446655440036",
      "text": "React",
      "order": 0,
      "created_at": "2026-04-25T11:11:54Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440038",
      "poll_id": "550e8400-e29b-41d4-a716-446655440036",
      "text": "Vue",
      "order": 1,
      "created_at": "2026-04-25T11:11:54Z"
    }
  ],
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /culture/polls/{id}/results
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "option_id": "550e8400-e29b-41d4-a716-446655440037",
      "text": "React",
      "votes": 45
    },
    {
      "option_id": "550e8400-e29b-41d4-a716-446655440038",
      "text": "Vue",
      "votes": 30
    }
  ],
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /culture/polls/{id}/vote
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "option_id": "550e8400-e29b-41d4-a716-446655440037",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```
**Required Fields:** `option_id` (UUID), `user_id` (UUID)

**Response:** `204 No Content`

---

## 21. Culture - Recognitions

### GET /culture/recognitions
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `to_user_id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440039",
      "from_user_id": "550e8400-e29b-41d4-a716-446655440000",
      "to_user_id": "550e8400-e29b-41d4-a716-446655440005",
      "type": "kudos",
      "message": "Great work on the project!",
      "points": 50,
      "created_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /culture/recognitions
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "from_user_id": "550e8400-e29b-41d4-a716-446655440000",
  "to_user_id": "550e8400-e29b-41d4-a716-446655440005",
  "type": "award",
  "message": "Employee of the month!",
  "points": 100
}
```
**Required Fields:** `from_user_id` (UUID), `to_user_id` (UUID), `type` (oneof: kudos, award, milestone), `message`  
**Optional:** `points` (gte=0)

**Response:** `201 Created` -> `RecognitionResponse`

---

### GET /culture/recognitions/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `RecognitionResponse`

---

### GET /culture/leaderboard
**Auth:** BearerAuth  
**Query Parameters:** `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440005",
      "total_points": 500,
      "count": 25
    },
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "total_points": 450,
      "count": 20
    }
  ],
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

## 22. Clients

### GET /clients
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `sort`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440014",
      "name": "Acme Corp",
      "industry": "Technology",
      "website": "https://acme.com",
      "address": "123 Business St",
      "tax_id": "TAX123456",
      "status": "active",
      "account_manager_id": "550e8400-e29b-41d4-a716-446655440000",
      "notes": "Key client",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /clients
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "name": "TechStart Inc",
  "industry": "Startup",
  "website": "https://techstart.com",
  "address": "456 Startup Ave",
  "tax_id": "TAX789012",
  "status": "prospect",
  "account_manager_id": "550e8400-e29b-41d4-a716-446655440000",
  "notes": "Potential big client"
}
```
**Required Fields:** `name` (max 255)  
**Optional:** `industry` (max 100), `website` (max 500, URL), `address`, `tax_id` (max 50), `status` (oneof: active, inactive, prospect, churned), `account_manager_id` (UUID), `notes`

**Response:** `201 Created` -> `ClientResponse`

---

### GET /clients/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `ClientResponse`

---

### PUT /clients/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "TechStart Inc - Updated",
  "industry": "Technology",
  "website": "https://techstart.io",
  "address": "789 Tech Blvd",
  "tax_id": "TAX789012",
  "status": "active",
  "account_manager_id": "550e8400-e29b-41d4-a716-446655440000",
  "notes": "Signed contract"
}
```
**All fields optional**

**Response:** `200 OK` -> `ClientResponse`

---

### DELETE /clients/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### GET /clients/{id}/contacts
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "client_id": "550e8400-e29b-41d4-a716-446655440014",
      "name": "John Smith",
      "email": "john@acme.com",
      "phone": "+1234567890",
      "role": "primary",
      "is_primary": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /clients/{id}/contacts
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@acme.com",
  "phone": "+0987654321",
  "role": "secondary",
  "is_primary": false
}
```
**Required Fields:** `name` (max 255), `email` (email format, max 255)  
**Optional:** `phone` (max 50), `role` (oneof: primary, secondary, billing, technical), `is_primary`

**Response:** `201 Created` -> `ContactResponse`

---

### GET /clients/{id}/projects
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> Array of `ProjectResponse`

---

### GET /clients/{id}/contracts
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> Array of `ContractResponse`

---

### GET /clients/{id}/invoices
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> Array of invoices (TODO)

---

## 23. Contacts

### GET /contacts/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `ContactResponse`

---

### PUT /contacts/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Jane Doe - Updated",
  "email": "jane.doe@acme.com",
  "phone": "+1122334455",
  "role": "billing",
  "is_primary": true
}
```
**All fields optional**

**Response:** `200 OK` -> `ContactResponse`

---

### DELETE /contacts/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

## 24. Contracts

### GET /contracts
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `sort`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440041",
      "client_id": "550e8400-e29b-41d4-a716-446655440014",
      "title": "Website Development Contract",
      "start_date": "2026-01-01T00:00:00Z",
      "end_date": "2026-12-31T00:00:00Z",
      "value": 50000.00,
      "status": "active",
      "terms": "Standard terms and conditions",
      "renewal_date": "2026-11-01T00:00:00Z",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 30,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /contracts
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "client_id": "550e8400-e29b-41d4-a716-446655440014",
  "title": "Mobile App Contract",
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2026-12-31T00:00:00Z",
  "value": 100000.00,
  "status": "draft",
  "terms": "Custom terms",
  "renewal_date": "2026-11-01T00:00:00Z"
}
```
**Required Fields:** `client_id` (UUID), `title` (max 255), `start_date`  
**Optional:** `end_date`, `value` (gte=0), `status` (oneof: draft, active, expired, terminated, renewed), `terms`, `renewal_date`

**Response:** `201 Created` -> `ContractResponse`

---

### GET /contracts/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `ContractResponse`

---

### PUT /contracts/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "title": "Mobile App Contract - Updated",
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2027-05-01T00:00:00Z",
  "value": 120000.00,
  "terms": "Updated terms",
  "renewal_date": "2027-04-01T00:00:00Z"
}
```
**All fields optional**

**Response:** `200 OK` -> `ContractResponse`

---

### DELETE /contracts/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

### POST /contracts/{id}/renew
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "new_end_date": "2027-12-31T00:00:00Z"
}
```
**Required Fields:** `new_end_date` (ISO 8601)

**Response:** `200 OK` -> `ContractResponse`

---

### POST /contracts/{id}/terminate
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `ContractResponse`

---

## 25. Proposals

### GET /proposals/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440042",
    "client_id": "550e8400-e29b-41d4-a716-446655440014",
    "title": "Website Redesign Proposal",
    "description": "Proposal for redesigning the company website",
    "value": 50000.00,
    "status": "draft",
    "valid_until": "2026-05-25T00:00:00Z",
    "sent_at": null,
    "created_at": "2026-04-01T00:00:00Z",
    "updated_at": "2026-04-25T10:00:00Z"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### PUT /proposals/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "title": "Website Redesign Proposal - Updated",
  "description": "Updated proposal with new features",
  "value": 60000.00,
  "valid_until": "2026-06-25T00:00:00Z"
}
```
**All fields optional**  
**Validation:** `value` (gte=0)

**Response:** `200 OK` -> `ProposalResponse`

---

### DELETE /proposals/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `204 No Content`

---

## 26. Support Tickets

### GET /tickets
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `sort`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440043",
      "client_id": "550e8400-e29b-41d4-a716-446655440014",
      "contact_id": "550e8400-e29b-41d4-a716-446655440040",
      "title": "Website not loading",
      "description": "The website is not loading on mobile devices",
      "priority": "high",
      "status": "open",
      "assigned_to": null,
      "resolved_at": null,
      "created_at": "2026-04-25T10:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /tickets
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "client_id": "550e8400-e29b-41d4-a716-446655440014",
  "contact_id": "550e8400-e29b-41d4-a716-446655440040",
  "title": "API timeout issue",
  "description": "API requests are timing out",
  "priority": "critical"
}
```
**Required Fields:** `client_id` (UUID), `title` (max 255)  
**Optional:** `contact_id` (UUID), `description`, `priority` (oneof: low, medium, high, critical)

**Response:** `201 Created` -> `TicketResponse`

---

### GET /tickets/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `TicketResponse`

---

### PUT /tickets/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "title": "API timeout issue - Updated",
  "description": "API requests are timing out on production",
  "priority": "critical",
  "status": "in_progress"
}
```
**All fields optional**  
**Validation:** `priority` (oneof: low, medium, high, critical), `status` (oneof: open, in_progress, resolved, closed)

**Response:** `200 OK` -> `TicketResponse`

---

### POST /tickets/{id}/assign
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "assigned_to": "550e8400-e29b-41d4-a716-446655440000"
}
```
**Required Fields:** `assigned_to` (UUID)

**Response:** `200 OK` -> `TicketResponse`

---

### POST /tickets/{id}/resolve
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `TicketResponse`

---

### GET /tickets/{id}/comments
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440044",
      "ticket_id": "550e8400-e29b-41d4-a716-446655440043",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Investigating the issue",
      "is_internal": true,
      "created_at": "2026-04-25T11:11:54Z",
      "updated_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /tickets/{id}/comments
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "content": "Issue has been resolved",
  "is_internal": false
}
```
**Required Fields:** `content`  
**Optional:** `is_internal`

**Response:** `201 Created` -> `TicketCommentResponse`

---

## 27. Finance - Payroll

### GET /payroll
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `sort`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440045",
      "month": 4,
      "year": 2026,
      "start_date": "2026-04-01T00:00:00Z",
      "end_date": "2026-04-30T00:00:00Z",
      "status": "draft",
      "processed_at": null,
      "processed_by": null,
      "created_at": "2026-04-25T11:11:54Z",
      "updated_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /payroll/generate
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "month": 5,
  "year": 2026,
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2026-05-31T00:00:00Z"
}
```
**Required Fields:** `month` (gte=1, lte=12), `year` (gte=2000), `start_date`, `end_date`

**Response:** `201 Created` -> `PayrollCycleResponse`

---

### GET /payroll/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `PayrollCycleResponse`

---

### PUT /payroll/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2026-05-31T00:00:00Z"
}
```
**All fields optional**

**Response:** `200 OK` -> `PayrollCycleResponse`

---

### POST /payroll/{id}/process
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `PayrollCycleResponse`

---

### POST /payroll/{id}/publish
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `PayrollCycleResponse`

---

### GET /payroll/{id}/payslips
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440046",
      "payroll_cycle_id": "550e8400-e29b-41d4-a716-446655440045",
      "employee_id": "550e8400-e29b-41d4-a716-446655440005",
      "basic_salary": 75000.00,
      "allowances": {
        "housing": 5000.00,
        "transport": 2000.00
      },
      "deductions": {
        "tax": 15000.00,
        "insurance": 3000.00
      },
      "net_pay": 64000.00,
      "status": "draft",
      "created_at": "2026-04-25T11:11:54Z",
      "updated_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /payroll/my
**Auth:** BearerAuth

**Response:** `200 OK` -> Array of payslips (TODO)

---

### GET /payroll/my/payslips/{id}/download
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> Binary PDF file

---

## 28. Finance - Salary Structures

### GET /salary-structures
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `sort`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440047",
      "employee_id": "550e8400-e29b-41d4-a716-446655440005",
      "basic_salary": 75000.00,
      "allowances": {
        "housing": 5000.00,
        "transport": 2000.00
      },
      "deductions": {
        "tax": 15000.00,
        "insurance": 3000.00
      },
      "gross_salary": 82000.00,
      "total_deductions": 18000.00,
      "net_salary": 64000.00,
      "effective_from": "2026-01-01T00:00:00Z",
      "effective_to": null,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /salary-structures
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "employee_id": "550e8400-e29b-41d4-a716-446655440005",
  "basic_salary": 80000.00,
  "allowances": {
    "housing": 6000.00,
    "transport": 2500.00
  },
  "deductions": {
    "tax": 16000.00,
    "insurance": 3500.00
  },
  "effective_from": "2026-05-01T00:00:00Z",
  "effective_to": null
}
```
**Required Fields:** `employee_id` (UUID), `basic_salary` (gte=0), `effective_from`  
**Optional:** `allowances` (object), `deductions` (object), `effective_to`

**Response:** `201 Created` -> `SalaryStructureResponse`

---

### GET /salary-structures/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `SalaryStructureResponse`

---

### PUT /salary-structures/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "basic_salary": 85000.00,
  "allowances": {
    "housing": 6500.00,
    "transport": 3000.00,
    "meal": 1500.00
  },
  "deductions": {
    "tax": 17000.00,
    "insurance": 4000.00
  },
  "effective_from": "2026-06-01T00:00:00Z",
  "effective_to": null
}
```
**All fields optional**  
**Validation:** `basic_salary` (gte=0)

**Response:** `200 OK` -> `SalaryStructureResponse`

---

## 29. Finance - Expenses

### GET /expenses
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `sort`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440048",
      "employee_id": "550e8400-e29b-41d4-a716-446655440005",
      "category": "Travel",
      "amount": 500.00,
      "description": "Flight to Boston",
      "receipt_url": "https://example.com/receipts/flight.pdf",
      "incurred_at": "2026-04-20T00:00:00Z",
      "status": "pending",
      "approved_by": null,
      "approved_at": null,
      "rejection_reason": null,
      "created_at": "2026-04-25T11:11:54Z",
      "updated_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /expenses
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "employee_id": "550e8400-e29b-41d4-a716-446655440005",
  "category": "Meals",
  "amount": 75.50,
  "description": "Client lunch",
  "receipt_url": "https://example.com/receipts/lunch.pdf",
  "incurred_at": "2026-04-25T12:00:00Z"
}
```
**Required Fields:** `employee_id` (UUID), `category` (max 100), `amount` (gte=0), `incurred_at`  
**Optional:** `description`, `receipt_url` (max 500, URL)

**Response:** `201 Created` -> `ExpenseResponse`

---

### GET /expenses/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `ExpenseResponse`

---

### PUT /expenses/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "category": "Meals",
  "amount": 85.00,
  "description": "Client lunch - Updated",
  "receipt_url": "https://example.com/receipts/lunch-v2.pdf",
  "incurred_at": "2026-04-25T12:00:00Z"
}
```
**All fields optional**  
**Validation:** `amount` (gte=0)

**Response:** `200 OK` -> `ExpenseResponse`

---

### POST /expenses/{id}/approve
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "approved_by": "550e8400-e29b-41d4-a716-446655440000"
}
```
**Required Fields:** `approved_by` (UUID)

**Response:** `200 OK` -> `ExpenseResponse`

---

### POST /expenses/{id}/reject
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "rejection_reason": "Receipt missing"
}
```
**Required Fields:** `rejection_reason`

**Response:** `200 OK` -> `ExpenseResponse`

---

### GET /expenses/my
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK` -> Array of `ExpenseResponse` (paginated)

---

## 30. Finance - Budgets

### GET /budgets
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `sort`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440049",
      "project_id": "550e8400-e29b-41d4-a716-446655440013",
      "name": "Website Redesign Budget",
      "total_amount": 50000.00,
      "spent_amount": 35000.00,
      "remaining_amount": 15000.00,
      "start_date": "2026-01-01T00:00:00Z",
      "end_date": "2026-06-30T00:00:00Z",
      "status": "active",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /budgets
**Auth:** BearerAuth  
**Request Body:**
```json
{
  "project_id": "550e8400-e29b-41d4-a716-446655440013",
  "name": "Mobile App Budget",
  "total_amount": 100000.00,
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2026-12-31T00:00:00Z"
}
```
**Required Fields:** `project_id` (UUID), `name` (max 255), `total_amount` (gte=0), `start_date`, `end_date`

**Response:** `201 Created` -> `BudgetResponse`

---

### GET /budgets/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `BudgetResponse`

---

### PUT /budgets/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "name": "Mobile App Budget - Updated",
  "total_amount": 120000.00,
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2027-03-31T00:00:00Z"
}
```
**All fields optional**  
**Validation:** `total_amount` (gte=0)

**Response:** `200 OK` -> `BudgetResponse`

---

### GET /budgets/{id}/transactions
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Query Parameters:** `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440050",
      "budget_id": "550e8400-e29b-41d4-a716-446655440049",
      "amount": 5000.00,
      "type": "expense",
      "description": "Server costs",
      "transaction_date": "2026-04-01T00:00:00Z",
      "created_at": "2026-04-01T00:00:00Z",
      "updated_at": "2026-04-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /budgets/{id}/transactions
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "amount": 3000.00,
  "type": "expense",
  "description": "Design tools subscription",
  "transaction_date": "2026-04-25T00:00:00Z"
}
```
**Required Fields:** `amount` (gte=0), `type` (oneof: income, expense), `transaction_date`  
**Optional:** `description`

**Response:** `201 Created` -> `BudgetTransactionResponse`

---

## 31. Audit & Compliance

### GET /audit-logs
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `sort`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440051",
      "timestamp": "2026-04-25T11:11:54Z",
      "actor_type": "user",
      "actor_id": "550e8400-e29b-41d4-a716-446655440000",
      "actor_email": "admin@syncwork.com",
      "actor_ip": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "action": "create",
      "resource_type": "project",
      "resource_id": "550e8400-e29b-41d4-a716-446655440013",
      "module": "projects",
      "endpoint": "POST /api/v1/projects",
      "before_data": null,
      "after_data": {
        "name": "Website Redesign"
      },
      "metadata": null,
      "severity": "info",
      "created_at": "2026-04-25T11:11:54Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10000,
    "totalPages": 500,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /audit-logs/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)

**Response:** `200 OK` -> `AuditLogResponse`

---

### GET /audit-logs/search
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`  
**Request Body (optional):**
```json
{
  "actor_type": "user",
  "actor_id": "550e8400-e29b-41d4-a716-446655440000",
  "action": "create",
  "resource_type": "project",
  "resource_id": "550e8400-e29b-41d4-a716-446655440013",
  "module": "projects",
  "severity": "info",
  "start_date": "2026-04-01T00:00:00Z",
  "end_date": "2026-04-30T23:59:59Z"
}
```
**All fields optional**  
**Validation:** `actor_type` (oneof: user, system, api), `severity` (oneof: info, warning, critical)

**Response:** `200 OK` -> Array of `AuditLogResponse` (paginated)

---

### GET /audit-logs/export
**Auth:** BearerAuth

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "download_url": "https://storage.example.com/exports/audit-logs.csv"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /audit-logs/stats
**Auth:** BearerAuth  
**Query Parameters:** `start_date`, `end_date`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_logs": 10000,
    "by_action": {
      "create": 3000,
      "update": 4000,
      "delete": 1000,
      "read": 2000
    },
    "by_resource_type": {
      "project": 2000,
      "task": 3000,
      "user": 1000
    },
    "by_severity": {
      "info": 9000,
      "warning": 800,
      "critical": 200
    },
    "by_module": {
      "projects": 3000,
      "tasks": 4000,
      "users": 1000
    },
    "by_day": {
      "2026-04-24": 500,
      "2026-04-25": 600
    }
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /compliance/gdpr/export
**Auth:** BearerAuth

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440052",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "gdpr_export",
    "status": "pending",
    "requested_at": "2026-04-25T11:11:54Z",
    "completed_at": null,
    "file_url": null,
    "expires_at": null,
    "created_at": "2026-04-25T11:11:54Z",
    "updated_at": "2026-04-25T11:11:54Z"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### POST /compliance/gdpr/delete-request
**Auth:** BearerAuth

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "GDPR deletion request submitted successfully",
    "status": "pending"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /compliance/retention-policies
**Auth:** BearerAuth

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440053",
      "data_type": "audit_logs",
      "retention_period": 2555,
      "action": "archive",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### PUT /compliance/retention-policies/{id}
**Auth:** BearerAuth  
**Path Parameters:** `id` (string, UUID)  
**Request Body:**
```json
{
  "retention_period": 3650,
  "action": "anonymize",
  "is_active": true
}
```
**All fields optional**  
**Validation:** `retention_period` (gte=1), `action` (oneof: delete, anonymize, archive)

**Response:** `200 OK` -> `DataRetentionPolicyResponse`

---

### GET /compliance/reports
**Auth:** BearerAuth

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_users": 100,
    "active_users": 95,
    "data_exports": 10,
    "deletion_requests": 2,
    "retention_policies": 5
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /compliance/export-requests
**Auth:** BearerAuth  
**Query Parameters:** `page`, `limit`, `user_id`

**Response:** `200 OK` -> Array of `DataExportRequestResponse` (paginated)

---

## 32. File Upload

### POST /upload
**Auth:** BearerAuth  
**Content-Type:** multipart/form-data  
**Form Data:**
- `file` (file, required) - File to upload (max 10MB)
- `folder` (string, optional, default="uploads")

**Allowed file types:**
- Images: image/jpeg, image/png, image/gif, image/webp
- Documents: application/pdf, text/plain
- Office: application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Spreadsheets: application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/uploads/photo.jpg",
    "filename": "photo.jpg",
    "size": 2048000,
    "type": "image/jpeg",
    "folder": "uploads"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

### GET /files/{folder}/{filename}
**Auth:** No  
**Path Parameters:** `folder`, `filename`

**Response:** `200 OK` -> Binary file content

---

## 33. WebSocket

### GET /ws
**Auth:** BearerAuth (via query param or header)  
**Query Parameters:** `token` (string, optional)  
**Or Header:** `Authorization: Bearer <token>`

**Response:** `101 Switching Protocols` - WebSocket connection established

**Message Format:**
```json
{
  "type": "chat_message",
  "payload": {
    "room_id": "550e8400-e29b-41d4-a716-446655440024",
    "content": "Hello!"
  }
}
```

---

## Common Patterns

### Pagination Query Parameters
Most list endpoints support:
- `page` (int, default=1)
- `limit` (int, default=20)
- `sort` (string, optional)

### UUID Path Parameters
Most single-resource endpoints use `{id}` path parameter (string, UUID format).

### Authentication
- **Public endpoints:** `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/password-reset`, `/auth/password-reset/confirm`
- **All other endpoints** require `BearerAuth` (JWT token in Authorization header)

### Response Patterns
- `200 OK` - Success with data
- `201 Created` - Resource created
- `204 No Content` - Success, no body
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid auth
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `500 Internal Server Error` - Server error

### Date Format
All dates use ISO 8601 format: `2026-04-25T11:11:54Z`

### UUID Format
All IDs use UUID v4 format: `550e8400-e29b-41d4-a716-446655440000`

---

*Generated for SyncWork API Development - Last Updated: 2026-04-25*
