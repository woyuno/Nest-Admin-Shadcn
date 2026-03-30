import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/online/')({
  beforeLoad: () => {
    throw redirect({ to: '/monitor/online' })
  },
})
