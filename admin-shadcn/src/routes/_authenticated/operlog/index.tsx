import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/operlog/')({
  beforeLoad: () => {
    throw redirect({ to: '/monitor/operlog' })
  },
})
