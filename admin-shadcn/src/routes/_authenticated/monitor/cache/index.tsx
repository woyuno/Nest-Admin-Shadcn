import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/views/auth/lib/route-access'
import { CacheMonitor } from '@/views/cache'

export const Route = createFileRoute('/_authenticated/monitor/cache/')({
  beforeLoad: () => {
    assertRouteAccess('/monitor/cache')
  },
  component: CacheMonitor,
})

