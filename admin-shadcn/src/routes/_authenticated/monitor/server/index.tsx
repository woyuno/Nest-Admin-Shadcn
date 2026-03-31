import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/views/auth/lib/route-access'
import { ServerMonitor } from '@/views/server'

export const Route = createFileRoute('/_authenticated/monitor/server/')({
  beforeLoad: () => {
    assertRouteAccess('/monitor/server')
  },
  component: ServerMonitor,
})

