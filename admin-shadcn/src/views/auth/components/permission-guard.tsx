import { type ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { hasPermission, hasRole } from '../lib/authorization-contract'

type PermissionGuardProps = {
  permissions?: string[]
  roles?: string[]
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({
  permissions,
  roles,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const user = useAuthStore((state) => state.auth.user)

  const canView =
    hasPermission(user?.permissions || [], permissions) &&
    hasRole(user?.roles || [], roles)

  return canView ? <>{children}</> : <>{fallback}</>
}
