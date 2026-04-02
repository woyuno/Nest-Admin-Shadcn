import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/views/auth/lib/route-access'
import { CacheList } from '@/views/cache-list'

export const Route = createFileRoute('/_authenticated/monitor/cacheList/')({
  beforeLoad: () => {
    assertRouteAccess('/monitor/cacheList')
  },
  component: CacheList,
})

