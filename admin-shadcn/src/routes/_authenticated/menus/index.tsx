import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/menus/')({
  beforeLoad: () => {
    throw redirect({ to: '/system/menu' })
  },
})
