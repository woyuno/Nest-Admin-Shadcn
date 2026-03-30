import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/gen/')({
  beforeLoad: () => {
    throw redirect({ to: '/tool/gen' })
  },
})
