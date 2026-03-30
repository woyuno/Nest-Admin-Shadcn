import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/features/auth/lib/route-access'
import { CacheList } from '@/features/cache-list'

export const Route = createFileRoute('/_authenticated/monitor/cacheList/')({
  beforeLoad: () => {
    assertRouteAccess('/monitor/cacheList')
  },
  component: CacheList,
})
