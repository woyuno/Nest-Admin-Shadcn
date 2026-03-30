import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/cache-list/')({
  beforeLoad: () => {
    throw redirect({ to: '/monitor/cacheList' })
  },
})
