import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSettingsProfileRedirectTarget } from '@/views/settings/lib/settings-paths'

export const Route = createFileRoute('/_authenticated/user/profile')({
  beforeLoad: () => {
    throw redirect({ to: getSettingsProfileRedirectTarget('/user/profile') })
  },
})

