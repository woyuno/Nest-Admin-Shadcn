import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/tool/gen-edit/index/$tableId'
)({
  beforeLoad: () => {
    throw redirect({ to: '/tool/gen' })
  },
})
