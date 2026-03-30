import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/depts/')({
  beforeLoad: () => {
    throw redirect({ to: '/system/dept' })
  },
})
