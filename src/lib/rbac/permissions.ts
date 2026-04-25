// RBAC Permission definitions
// Format: resource:action

export const Permissions = {
  // Staff & HR
  STAFF_VIEW: 'staff:view',
  STAFF_CREATE: 'staff:create',
  STAFF_UPDATE: 'staff:update',
  STAFF_DELETE: 'staff:delete',
  
  DEPARTMENT_VIEW: 'department:view',
  DEPARTMENT_MANAGE: 'department:manage',
  
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_MANAGE: 'attendance:manage',
  
  LEAVE_VIEW: 'leave:view',
  LEAVE_MANAGE: 'leave:manage',
  LEAVE_APPROVE: 'leave:approve',
  
  // Projects
  PROJECT_VIEW: 'project:view',
  PROJECT_CREATE: 'project:create',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  
  TASK_VIEW: 'task:view',
  TASK_CREATE: 'task:create',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  
  PIPELINE_VIEW: 'pipeline:view',
  PIPELINE_MANAGE: 'pipeline:manage',
  
  // Clients
  CLIENT_VIEW: 'client:view',
  CLIENT_CREATE: 'client:create',
  CLIENT_UPDATE: 'client:update',
  CLIENT_DELETE: 'client:delete',
  
  // Finance
  FINANCE_VIEW: 'finance:view',
  FINANCE_MANAGE: 'finance:manage',
  PAYROLL_VIEW: 'payroll:view',
  PAYROLL_MANAGE: 'payroll:manage',
  
  // Communication
  CHAT_VIEW: 'chat:view',
  CHAT_SEND: 'chat:send',
  ANNOUNCEMENT_VIEW: 'announcement:view',
  ANNOUNCEMENT_CREATE: 'announcement:create',
  ANNOUNCEMENT_DELETE: 'announcement:delete',
  
  // Culture
  EVENT_VIEW: 'event:view',
  EVENT_CREATE: 'event:create',
  EVENT_MANAGE: 'event:manage',
  
  POLL_VIEW: 'poll:view',
  POLL_CREATE: 'poll:create',
  POLL_VOTE: 'poll:vote',
  
  RECOGNITION_VIEW: 'recognition:view',
  RECOGNITION_CREATE: 'recognition:create',
  
  // Audit
  AUDIT_VIEW: 'audit:view',
  
  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',
  
  // Admin
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  SYSTEM_SETTINGS: 'system:settings',
} as const;

export type PermissionValue = typeof Permissions[keyof typeof Permissions];

// Role definitions with default permissions
export const RolePermissions: Record<string, string[]> = {
  super_admin: Object.values(Permissions),
  admin: [
    Permissions.STAFF_VIEW, Permissions.STAFF_CREATE, Permissions.STAFF_UPDATE,
    Permissions.DEPARTMENT_MANAGE, Permissions.ATTENDANCE_MANAGE,
    Permissions.LEAVE_MANAGE, Permissions.LEAVE_APPROVE,
    Permissions.PROJECT_VIEW, Permissions.PROJECT_CREATE, Permissions.PROJECT_UPDATE,
    Permissions.TASK_VIEW, Permissions.TASK_CREATE, Permissions.TASK_UPDATE,
    Permissions.PIPELINE_VIEW, Permissions.PIPELINE_MANAGE,
    Permissions.CLIENT_VIEW, Permissions.CLIENT_CREATE, Permissions.CLIENT_UPDATE,
    Permissions.FINANCE_VIEW, Permissions.FINANCE_MANAGE,
    Permissions.PAYROLL_VIEW, Permissions.PAYROLL_MANAGE,
    Permissions.CHAT_VIEW, Permissions.CHAT_SEND,
    Permissions.ANNOUNCEMENT_VIEW, Permissions.ANNOUNCEMENT_CREATE,
    Permissions.EVENT_VIEW, Permissions.EVENT_CREATE, Permissions.EVENT_MANAGE,
    Permissions.POLL_VIEW, Permissions.POLL_CREATE,
    Permissions.RECOGNITION_VIEW, Permissions.RECOGNITION_CREATE,
    Permissions.AUDIT_VIEW,
    Permissions.SETTINGS_VIEW, Permissions.SETTINGS_MANAGE,
    Permissions.USER_MANAGE, Permissions.ROLE_MANAGE,
  ],
  manager: [
    Permissions.STAFF_VIEW,
    Permissions.DEPARTMENT_VIEW,
    Permissions.ATTENDANCE_VIEW, Permissions.ATTENDANCE_MANAGE,
    Permissions.LEAVE_VIEW, Permissions.LEAVE_APPROVE,
    Permissions.PROJECT_VIEW, Permissions.PROJECT_CREATE, Permissions.PROJECT_UPDATE,
    Permissions.TASK_VIEW, Permissions.TASK_CREATE, Permissions.TASK_UPDATE,
    Permissions.PIPELINE_VIEW, Permissions.PIPELINE_MANAGE,
    Permissions.CLIENT_VIEW, Permissions.CLIENT_CREATE, Permissions.CLIENT_UPDATE,
    Permissions.FINANCE_VIEW,
    Permissions.CHAT_VIEW, Permissions.CHAT_SEND,
    Permissions.ANNOUNCEMENT_VIEW,
    Permissions.EVENT_VIEW, Permissions.EVENT_CREATE,
    Permissions.POLL_VIEW, Permissions.POLL_VOTE,
    Permissions.RECOGNITION_VIEW, Permissions.RECOGNITION_CREATE,
    Permissions.SETTINGS_VIEW,
  ],
  employee: [
    Permissions.STAFF_VIEW,
    Permissions.ATTENDANCE_VIEW,
    Permissions.LEAVE_VIEW, Permissions.LEAVE_MANAGE,
    Permissions.PROJECT_VIEW,
    Permissions.TASK_VIEW, Permissions.TASK_UPDATE,
    Permissions.PIPELINE_VIEW,
    Permissions.CLIENT_VIEW,
    Permissions.CHAT_VIEW, Permissions.CHAT_SEND,
    Permissions.ANNOUNCEMENT_VIEW,
    Permissions.EVENT_VIEW,
    Permissions.POLL_VIEW, Permissions.POLL_VOTE,
    Permissions.RECOGNITION_VIEW,
    Permissions.SETTINGS_VIEW,
  ],
  hr: [
    Permissions.STAFF_VIEW, Permissions.STAFF_CREATE, Permissions.STAFF_UPDATE,
    Permissions.DEPARTMENT_VIEW, Permissions.DEPARTMENT_MANAGE,
    Permissions.ATTENDANCE_VIEW, Permissions.ATTENDANCE_MANAGE,
    Permissions.LEAVE_VIEW, Permissions.LEAVE_MANAGE, Permissions.LEAVE_APPROVE,
    Permissions.PAYROLL_VIEW, Permissions.PAYROLL_MANAGE,
    Permissions.EVENT_VIEW, Permissions.EVENT_CREATE, Permissions.EVENT_MANAGE,
    Permissions.RECOGNITION_VIEW, Permissions.RECOGNITION_CREATE,
    Permissions.SETTINGS_VIEW,
  ],
  finance: [
    Permissions.STAFF_VIEW,
    Permissions.PROJECT_VIEW,
    Permissions.CLIENT_VIEW,
    Permissions.FINANCE_VIEW, Permissions.FINANCE_MANAGE,
    Permissions.PAYROLL_VIEW, Permissions.PAYROLL_MANAGE,
    Permissions.CHAT_VIEW, Permissions.CHAT_SEND,
    Permissions.ANNOUNCEMENT_VIEW,
    Permissions.SETTINGS_VIEW,
  ],
};

// Permission checking utility
export function checkPermission(
  userRoles: string[],
  requiredPermission: string,
  userPermissions?: string[]
): boolean {
  // Super admin always has all permissions
  if (userRoles.includes('super_admin')) return true;
  
  // Check explicit user permissions first
  if (userPermissions?.includes(requiredPermission)) return true;
  
  // Check role-based permissions
  return userRoles.some((role) => {
    const rolePerms = RolePermissions[role] || [];
    return rolePerms.includes(requiredPermission);
  });
}

export function checkAnyPermission(
  userRoles: string[],
  requiredPermissions: string[],
  userPermissions?: string[]
): boolean {
  return requiredPermissions.some((perm) => 
    checkPermission(userRoles, perm, userPermissions)
  );
}

export function checkAllPermissions(
  userRoles: string[],
  requiredPermissions: string[],
  userPermissions?: string[]
): boolean {
  return requiredPermissions.every((perm) => 
    checkPermission(userRoles, perm, userPermissions)
  );
}
