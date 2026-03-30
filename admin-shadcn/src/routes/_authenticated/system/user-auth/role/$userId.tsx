import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/system/user-auth/role/$userId'
)({
  beforeLoad: () => {
    throw redirect({ to: '/system/user' })
  },
})
