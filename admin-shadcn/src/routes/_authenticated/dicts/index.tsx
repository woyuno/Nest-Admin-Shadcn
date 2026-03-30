import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dicts/')({
  beforeLoad: () => {
    throw redirect({ to: '/system/dict' })
  },
})
