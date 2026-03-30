import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/notices/')({
  beforeLoad: () => {
    throw redirect({ to: '/system/notice' })
  },
})
