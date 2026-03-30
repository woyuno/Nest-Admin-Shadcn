import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/server/')({
  beforeLoad: () => {
    throw redirect({ to: '/monitor/server' })
  },
})
