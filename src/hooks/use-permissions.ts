'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { checkPermission, checkAnyPermission, checkAllPermissions, PermissionValue } from '@/lib/rbac/permissions';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles || [];
  const userPermissions = user?.permissions || [];

  const hasPermission = (permission: PermissionValue | string) => {
    return checkPermission(roles, permission, userPermissions);
  };

  const hasAnyPermission = (permissions: (PermissionValue | string)[]) => {
    return checkAnyPermission(roles, permissions, userPermissions);
  };

  const hasAllPermissions = (permissions: (PermissionValue | string)[]) => {
    return checkAllPermissions(roles, permissions, userPermissions);
  };

  const isAdmin = () => roles.includes('super_admin') || roles.includes('admin');
  const isSuperAdmin = () => roles.includes('super_admin');

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    roles,
    user,
  };
}
