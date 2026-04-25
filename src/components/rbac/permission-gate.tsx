'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionValue } from '@/lib/rbac/permissions';

interface PermissionGateProps {
  permission: PermissionValue | string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface AnyPermissionGateProps {
  permissions: (PermissionValue | string)[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function AnyPermissionGate({ permissions, children, fallback = null }: AnyPermissionGateProps) {
  const { hasAnyPermission } = usePermissions();
  
  if (!hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface AllPermissionsGateProps {
  permissions: (PermissionValue | string)[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function AllPermissionsGate({ permissions, children, fallback = null }: AllPermissionsGateProps) {
  const { hasAllPermissions } = usePermissions();
  
  if (!hasAllPermissions(permissions)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface RoleGateProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { user } = usePermissions();
  const userRoles = user?.roles || [];
  
  const hasRole = roles.some((role) => userRoles.includes(role));
  
  if (!hasRole) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface AdminGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminGate({ children, fallback = null }: AdminGateProps) {
  const { isAdmin } = usePermissions();
  
  if (!isAdmin()) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
