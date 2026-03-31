import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import {
  ensureAuthorizationContext,
  ensureCurrentUser,
} from '@/views/auth/lib/auth-session'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const auth = useAuthStore.getState().auth

    if (!auth.accessToken) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }

    try {
      await ensureCurrentUser()
      await ensureAuthorizationContext()
    } catch {
      auth.reset()
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})

