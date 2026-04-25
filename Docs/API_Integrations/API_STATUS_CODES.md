# SyncWork API - Complete Endpoint Reference with Error Codes

> **Companion Documents:**
> - [API Schemas](./API_SCHEMAS.md) - Request/response body schemas
> - [Frontend Integration Guide](./FRONTEND_API_INTEGRATION_GUIDE.md) - TanStack Query hooks

---

## HTTP Status Code Reference

### Success Codes
| Status | Description | When Used |
|--------|-------------|-----------|
| `200 OK` | Request successful | Standard GET, PUT, POST responses |
| `201 Created` | Resource created | POST creating new resources |
| `202 Accepted` | Accepted for processing | Async operations (GDPR export) |
| `204 No Content` | Success, no body | DELETE, some PUT/POST |

### Error Codes
| Status | Code | Description | When Returned |
|--------|------|-------------|---------------|
| `400` | `VALIDATION_ERROR` | Invalid request data | Malformed JSON, field validation failures, invalid UUID format |
| `400` | `BAD_REQUEST` | Bad request | Invalid query parameters, missing required fields |
| `401` | `AUTH_UNAUTHORIZED` | Missing/invalid auth | No token, invalid token, expired token |
| `401` | `AUTH_TOKEN_EXPIRED` | Token expired | JWT token has expired |
| `401` | `AUTH_TOKEN_INVALID` | Invalid token | Malformed or invalid JWT |
| `403` | `AUTH_FORBIDDEN` | Permission denied | Insufficient permissions, not resource owner |
| `404` | `RESOURCE_NOT_FOUND` | Resource missing | Entity doesn't exist in database |
| `409` | `RESOURCE_ALREADY_EXISTS` | Already exists | Duplicate unique fields (email, name) |
| `409` | `CONFLICT` | State conflict | Invalid state transition (e.g., complete already completed sprint) |
| `413` | - | File too large | Upload exceeds 10MB |
| `500` | `INTERNAL_SERVER_ERROR` | Server error | Database errors, unexpected exceptions |
| `500` | `DATABASE_ERROR` | Database failure | Connection/query failures |

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable description",
    "details": [
      { "field": "field_name", "message": "Field-specific error" }
    ],
    "traceId": "trace_xxx"
  },
  "meta": {
    "timestamp": "2026-04-25T11:11:54Z"
  }
}
```

---

## Endpoint Reference by Category

### 1. Authentication

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/auth/register` | POST | 201 | 400, 409, 500 | 400: Invalid JSON/validation; 409: User already exists; 500: Server error |
| `/auth/login` | POST | 200 | 400, 401, 500 | 400: Invalid JSON/validation; 401: Invalid credentials; 500: Server error |
| `/auth/me` | GET | 200 | 401, 404 | 401: Missing/invalid token; 404: User not found |
| `/auth/refresh` | POST | 200 | 400, 401, 500 | 400: Invalid JSON; 401: Invalid refresh token; 500: Server error |
| `/auth/logout` | POST | 200 | 401, 500 | 401: Missing/invalid token; 500: Server error |
| `/auth/password-reset` | POST | 200 | 400, 500 | 400: Invalid JSON/validation; 500: Server error |
| `/auth/password-reset/confirm` | POST | 200 | 400, 500 | 400: Invalid JSON/validation; 500: Server error |

**Error Examples:**

**400 - Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Email must be a valid email address" },
      { "field": "password", "message": "Password must be at least 8 characters" }
    ]
  }
}
```

**401 - Invalid Credentials:**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**409 - User Already Exists:**
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_ALREADY_EXISTS",
    "message": "User with this email already exists"
  }
}
```

---

### 2. Users

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/users` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/users/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: User not found |
| `/users/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: User not found; 500: Server error |
| `/users/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/users/{id}/password` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: User not found; 500: Server error |

---

### 3. Roles & Permissions (RBAC)

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/roles` | POST | 201 | 400, 401, 409, 500 | 400: Invalid JSON; 401: Unauthorized; 409: Role already exists; 500: Server error |
| `/roles` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/roles/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Role not found |
| `/roles/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Role not found; 500: Server error |
| `/roles/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/users/{user_id}/roles` | POST | 200 | 400, 401, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 500: Server error |
| `/users/{user_id}/roles/{role_id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/permissions` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/permissions` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |

---

### 4. Staff

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/staff` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/staff` | POST | 201 | 400, 409, 500 | 400: Invalid JSON; 409: Staff already exists; 500: Server error |
| `/staff/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Staff not found |
| `/staff/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Staff not found; 500: Server error |
| `/staff/{id}` | DELETE | 204 | 400, 401, 404, 500 | 400: Invalid UUID; 401: Unauthorized; 404: Staff not found; 500: Server error |
| `/staff/search` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/staff/org-chart` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/staff/{id}/documents` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Staff not found |
| `/staff/{id}/documents` | POST | 201 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Staff not found; 500: Server error |

---

### 5. Departments

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/departments` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/departments` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/departments/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Department not found |
| `/departments/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Department not found; 500: Server error |
| `/departments/{id}` | DELETE | 204 | 400, 401, 404, 500 | 400: Invalid UUID; 401: Unauthorized; 404: Department not found; 500: Server error |
| `/departments/{id}/staff` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Department not found |

---

### 6. Attendance

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/attendance` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/attendance/check-in` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/attendance/check-out` | POST | 200 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/attendance/reports` | GET | 200 | 400, 401, 500 | 400: Invalid query params; 401: Unauthorized; 500: Server error |
| `/attendance/my` | GET | 200 | 401 | 401: Unauthorized |

---

### 7. Leave

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/leaves` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/leaves` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/leaves/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Leave not found |
| `/leaves/{id}/approve` | PUT | 200 | 400, 401, 404 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Leave not found |
| `/leaves/{id}/reject` | PUT | 200 | 400, 401, 404 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Leave not found |
| `/leaves/balance` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/leaves/types` | GET | 200 | 401 | 401: Unauthorized |

---

### 8. Performance Reviews

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/performance-reviews` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/performance-reviews` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/performance-reviews/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Review not found |
| `/performance-reviews/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Review not found; 500: Server error |

---

### 9. Projects

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/projects` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/projects` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/projects/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Project not found |
| `/projects/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Project not found; 500: Server error |
| `/projects/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/projects/{id}/members` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/projects/{id}/members` | POST | 201 | 400, 401, 409, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 409: Member already exists; 500: Server error |
| `/projects/{id}/members/{userId}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/projects/{id}/timeline` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Project not found |
| `/projects/{id}/budget` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Project not found |
| `/projects/templates` | GET | 200 | 401 | 401: Unauthorized |

---

### 10. Tasks

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/projects/{id}/tasks` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/projects/{id}/tasks` | POST | 201 | 400, 401, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 500: Server error |
| `/tasks/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Task not found |
| `/tasks/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Task not found; 500: Server error |
| `/tasks/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/tasks/{id}/assign` | POST | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Task not found; 500: Server error |
| `/tasks/{id}/status` | POST | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Task not found; 500: Server error |
| `/tasks/{id}/time-logs` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/tasks/{id}/time-logs` | POST | 201 | 400, 401, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 500: Server error |

---

### 11. Sprints

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/projects/{id}/sprints` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/projects/{id}/sprints` | POST | 201 | 400, 401, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 500: Server error |
| `/sprints/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Sprint not found |
| `/sprints/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Sprint not found; 500: Server error |
| `/sprints/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/sprints/{id}/start` | POST | 200 | 400, 401, 404, 409, 500 | 400: Invalid UUID; 401: Unauthorized; 404: Sprint not found; 409: Sprint already active; 500: Server error |
| `/sprints/{id}/complete` | POST | 200 | 400, 401, 404, 409, 500 | 400: Invalid UUID; 401: Unauthorized; 404: Sprint not found; 409: Sprint not active; 500: Server error |
| `/sprints/{id}/burndown` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Sprint not found |

---

### 12. Milestones

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/projects/{id}/milestones` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/projects/{id}/milestones` | POST | 201 | 400, 401, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 500: Server error |
| `/milestones/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Milestone not found |
| `/milestones/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Milestone not found; 500: Server error |
| `/milestones/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |

---

### 13. Pipelines (Boards)

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/pipelines` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/pipelines` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/pipelines/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Pipeline not found |
| `/pipelines/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Pipeline not found; 500: Server error |
| `/pipelines/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/pipelines/{id}/stages` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/pipelines/{id}/stages` | POST | 201 | 400, 401, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 500: Server error |
| `/pipelines/stages/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Stage not found; 500: Server error |
| `/pipelines/stages/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/pipelines/{id}/move-task` | POST | 200 | 400, 401, 409, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 409: Task move conflict; 500: Server error |

---

### 14. Automations

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/pipelines/{id}/automations` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/pipelines/{id}/automations` | POST | 201 | 400, 401, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 500: Server error |
| `/automations/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Automation not found |
| `/automations/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Automation not found; 500: Server error |
| `/automations/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |

---

### 15. Chat

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/chat/rooms` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/chat/rooms` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/chat/rooms/{id}` | GET | 200 | 400, 401, 403, 404 | 400: Invalid UUID; 401: Unauthorized; 403: Not a member; 404: Room not found |
| `/chat/rooms/{id}` | PUT | 200 | 400, 401, 403, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 403: Not owner; 404: Room not found; 500: Server error |
| `/chat/rooms/{id}` | DELETE | 204 | 400, 401, 403, 500 | 400: Invalid UUID; 401: Unauthorized; 403: Not owner; 500: Server error |
| `/chat/rooms/{id}/join` | POST | 204 | 400, 401, 409, 500 | 400: Invalid UUID; 401: Unauthorized; 409: Already a member; 500: Server error |
| `/chat/rooms/{id}/leave` | POST | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/chat/rooms/{id}/messages` | GET | 200 | 400, 401, 403, 500 | 400: Invalid UUID; 401: Unauthorized; 403: Not a member; 500: Server error |
| `/chat/rooms/{id}/messages` | POST | 201 | 400, 401, 403, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 403: Not a member; 500: Server error |
| `/chat/rooms/{id}/messages/{messageId}/thread` | GET | 200 | 400, 401, 403, 500 | 400: Invalid UUID; 401: Unauthorized; 403: Not a member; 500: Server error |
| `/chat/messages/{id}` | PUT | 200 | 400, 401, 403, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 403: Not author; 404: Message not found; 500: Server error |
| `/chat/messages/{id}` | DELETE | 204 | 400, 401, 403, 404, 500 | 400: Invalid UUID; 401: Unauthorized; 403: Not author; 404: Message not found; 500: Server error |
| `/chat/messages/{id}/reactions` | POST | 204 | 400, 401, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 500: Server error |
| `/chat/search` | GET | 200 | 400, 401, 403, 500 | 400: Invalid query params; 401: Unauthorized; 403: Not a member; 500: Server error |
| `/chat/rooms/{id}/read` | POST | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |

---

### 16. Announcements

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/announcements` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/announcements` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/announcements/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Announcement not found |
| `/announcements/{id}` | PUT | 200 | 400, 401, 403, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 403: Not owner/admin; 404: Not found; 500: Server error |
| `/announcements/{id}` | DELETE | 204 | 400, 401, 403, 500 | 400: Invalid UUID; 401: Unauthorized; 403: Not owner/admin; 500: Server error |
| `/announcements/{id}/pin` | POST | 200 | 400, 401, 403, 404, 500 | 400: Invalid UUID; 401: Unauthorized; 403: Not owner/admin; 404: Not found; 500: Server error |
| `/announcements/{id}/acknowledge` | POST | 204 | 400, 401, 409, 500 | 400: Invalid UUID; 401: Unauthorized; 409: Already acknowledged; 500: Server error |
| `/announcements/{id}/acknowledgements` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |

---

### 17. Notifications

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/notifications` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/notifications/unread-count` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/notifications/{id}/read` | PUT | 204 | 400, 401, 403, 404, 500 | 400: Invalid UUID; 401: Unauthorized; 403: Not owner; 404: Not found; 500: Server error |
| `/notifications/read-all` | PUT | 204 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/notifications/{id}` | DELETE | 204 | 400, 401, 403, 404, 500 | 400: Invalid UUID; 401: Unauthorized; 403: Not owner; 404: Not found; 500: Server error |
| `/notifications/preferences` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/notifications/preferences` | PUT | 200 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |

---

### 18. Culture - Events

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/culture/events` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/culture/events` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/culture/events/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Event not found |
| `/culture/events/{id}` | PUT | 200 | 400, 401, 404 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Event not found |
| `/culture/events/{id}` | DELETE | 204 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Event not found |
| `/culture/events/{id}/participants` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/culture/events/{id}/register` | POST | 201 | 400, 401, 404 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Event not found |
| `/culture/events/{id}/register/{user_id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/culture/events/{id}/gallery` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/culture/events/{id}/gallery` | POST | 201 | 400, 401, 404 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Event not found |

---

### 19. Culture - Trips

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/culture/trips` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/culture/trips` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/culture/trips/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Trip not found |
| `/culture/trips/{id}` | PUT | 200 | 400, 401, 404 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Trip not found |
| `/culture/trips/{id}` | DELETE | 204 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Trip not found |
| `/culture/trips/{id}/participants` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/culture/trips/{id}/register` | POST | 201 | 400, 401, 404 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Trip not found |
| `/culture/trips/{id}/itinerary` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/culture/trips/{id}/itinerary` | POST | 201 | 400, 401, 404 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Trip not found |

---

### 20. Culture - Polls

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/culture/polls` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/culture/polls` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/culture/polls/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Poll not found |
| `/culture/polls/{id}/options` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/culture/polls/{id}/results` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/culture/polls/{id}/vote` | POST | 204 | 400, 401, 404 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Poll not found |

---

### 21. Culture - Recognitions

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/culture/recognitions` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/culture/recognitions` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/culture/recognitions/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Recognition not found |
| `/culture/leaderboard` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |

---

### 22. Clients

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/clients` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/clients` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/clients/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Client not found |
| `/clients/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Client not found; 500: Server error |
| `/clients/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/clients/{id}/contacts` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Client not found |
| `/clients/{id}/contacts` | POST | 201 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Client not found; 500: Server error |
| `/clients/{id}/projects` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Client not found |
| `/clients/{id}/contracts` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Client not found |
| `/clients/{id}/invoices` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Client not found |

---

### 23. Contacts

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/contacts/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Contact not found |
| `/contacts/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Contact not found; 500: Server error |
| `/contacts/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |

---

### 24. Contracts

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/contracts` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/contracts` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/contracts/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Contract not found |
| `/contracts/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Contract not found; 500: Server error |
| `/contracts/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |
| `/contracts/{id}/renew` | POST | 200 | 400, 401, 404, 409 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Contract not found; 409: Cannot renew |
| `/contracts/{id}/terminate` | POST | 200 | 400, 401, 404, 409 | 400: Invalid UUID; 401: Unauthorized; 404: Contract not found; 409: Cannot terminate |

---

### 25. Proposals

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/proposals/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Proposal not found |
| `/proposals/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Proposal not found; 500: Server error |
| `/proposals/{id}` | DELETE | 204 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |

---

### 26. Support Tickets

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/tickets` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/tickets` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/tickets/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Ticket not found |
| `/tickets/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Ticket not found; 500: Server error |
| `/tickets/{id}/assign` | POST | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Ticket not found; 500: Server error |
| `/tickets/{id}/resolve` | POST | 200 | 400, 401, 404, 500 | 400: Invalid UUID; 401: Unauthorized; 404: Ticket not found; 500: Server error |
| `/tickets/{id}/comments` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Ticket not found |
| `/tickets/{id}/comments` | POST | 201 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Ticket not found; 500: Server error |

---

### 27. Finance - Payroll

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/payroll` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/payroll/generate` | POST | 201 | 400, 401, 409, 500 | 400: Invalid JSON; 401: Unauthorized; 409: Payroll cycle conflict; 500: Server error |
| `/payroll/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Payroll not found |
| `/payroll/{id}` | PUT | 200 | 400, 401, 404, 409, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Payroll not found; 409: Conflict; 500: Server error |
| `/payroll/{id}/process` | POST | 200 | 400, 401, 404, 409 | 400: Invalid UUID; 401: Unauthorized; 404: Payroll not found; 409: Already processed |
| `/payroll/{id}/publish` | POST | 200 | 400, 401, 404, 409 | 400: Invalid UUID; 401: Unauthorized; 404: Payroll not found; 409: Not processed yet |
| `/payroll/{id}/payslips` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Payroll not found |
| `/payroll/my` | GET | 200 | 401 | 401: Unauthorized |
| `/payroll/my/payslips/{id}/download` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Payslip not found |

---

### 28. Finance - Salary Structures

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/salary-structures` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/salary-structures` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/salary-structures/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Salary structure not found |
| `/salary-structures/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Not found; 500: Server error |

---

### 29. Finance - Expenses

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/expenses` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/expenses` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/expenses/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Expense not found |
| `/expenses/{id}` | PUT | 200 | 400, 401, 404, 409, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Not found; 409: Already approved; 500: Server error |
| `/expenses/{id}/approve` | POST | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Not found; 500: Server error |
| `/expenses/{id}/reject` | POST | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Not found; 500: Server error |
| `/expenses/my` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |

---

### 30. Finance - Budgets

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/budgets` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/budgets` | POST | 201 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/budgets/{id}` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Budget not found |
| `/budgets/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Not found; 500: Server error |
| `/budgets/{id}/transactions` | GET | 200 | 400, 401, 404 | 400: Invalid UUID; 401: Unauthorized; 404: Budget not found |
| `/budgets/{id}/transactions` | POST | 201 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Budget not found; 500: Server error |

---

### 31. Audit & Compliance

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/audit-logs` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/audit-logs/{id}` | GET | 200 | 400, 401, 404, 500 | 400: Invalid UUID; 401: Unauthorized; 404: Audit log not found; 500: Server error |
| `/audit-logs/search` | GET | 200 | 400, 401, 500 | 400: Invalid JSON; 401: Unauthorized; 500: Server error |
| `/audit-logs/export` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/audit-logs/stats` | GET | 200 | 400, 401, 500 | 400: Invalid date format; 401: Unauthorized; 500: Server error |
| `/compliance/gdpr/export` | GET | 202 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/compliance/gdpr/delete-request` | POST | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/compliance/retention-policies` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/compliance/retention-policies/{id}` | PUT | 200 | 400, 401, 404, 500 | 400: Invalid UUID/JSON; 401: Unauthorized; 404: Policy not found; 500: Server error |
| `/compliance/reports` | GET | 200 | 401, 500 | 401: Unauthorized; 500: Server error |
| `/compliance/export-requests` | GET | 200 | 400, 401, 500 | 400: Invalid UUID; 401: Unauthorized; 500: Server error |

---

### 32. File Upload

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/upload` | POST | 200 | 400, 401, 413, 500 | 400: No file or invalid type; 401: Unauthorized; 413: File > 10MB; 500: Server error |
| `/files/{folder}/{filename}` | GET | 200 | 404 | 404: File not found |

---

### 33. WebSocket

| Endpoint | Method | Success | Error Statuses | When Error Occurs |
|----------|--------|---------|----------------|-------------------|
| `/ws` | GET | 101 | 401, 500 | 401: Missing/invalid token; 500: Upgrade failure |

---

## Common Error Scenarios

### 400 - Validation Error
Occurs when:
- Request body contains invalid JSON
- Required fields are missing
- Field values fail validation (e.g., invalid email format, string too long)
- Invalid UUID format in path parameters
- Invalid date format (not ISO 8601)
- Invalid enum values

### 401 - Unauthorized
Occurs when:
- No Authorization header is present
- Token is expired
- Token is invalid or malformed
- User ID cannot be extracted from token context

### 403 - Forbidden
Occurs when:
- User doesn't have permission to access the resource
- User is not the owner of the resource
- User is not a member of the room/channel
- User doesn't have the required role

### 404 - Not Found
Occurs when:
- Resource ID doesn't exist in the database
- Entity has been deleted
- URL path doesn't match any endpoint

### 409 - Conflict
Occurs when:
- Creating a resource that already exists (duplicate email, role name)
- Invalid state transition (completing already completed sprint)
- Resource is in a state that prevents the operation
- Already acknowledged announcement
- Already a member of room

### 413 - Payload Too Large
Occurs when:
- Uploading a file larger than 10MB

### 500 - Internal Server Error
Occurs when:
- Database connection/query fails
- Unexpected server exception
- External service failure
- File system errors during upload

---

*Generated for SyncWork API Development - Last Updated: 2026-04-25*