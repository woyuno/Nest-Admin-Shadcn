import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/logininfor/')({
  beforeLoad: () => {
    throw redirect({ to: '/monitor/logininfor' })
  },
})
