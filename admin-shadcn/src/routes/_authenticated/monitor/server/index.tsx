import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/features/auth/lib/route-access'
import { ServerMonitor } from '@/features/server'

export const Route = createFileRoute('/_authenticated/monitor/server/')({
  beforeLoad: () => {
    assertRouteAccess('/monitor/server')
  },
  component: ServerMonitor,
})
