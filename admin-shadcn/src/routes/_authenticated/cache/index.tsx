import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/cache/')({
  beforeLoad: () => {
    throw redirect({ to: '/monitor/cache' })
  },
})
