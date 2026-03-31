import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { canAccessRoute } from './authorization-contract'
import { frontendPageRegistry } from './page-registry'

export function assertRouteAccess(pathname: string) {
  const user = useAuthStore.getState().auth.user

  const allowed = canAccessRoute({
    pathname,
    permissions: user?.permissions || [],
    roles: user?.roles || [],
    registry: frontendPageRegistry,
  })

  if (!allowed) {
    throw redirect({ to: '/403' })
  }
}
