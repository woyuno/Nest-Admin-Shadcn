import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/features/auth/lib/route-access'
import { CacheMonitor } from '@/features/cache'

export const Route = createFileRoute('/_authenticated/monitor/cache/')({
  beforeLoad: () => {
    assertRouteAccess('/monitor/cache')
  },
  component: CacheMonitor,
})
