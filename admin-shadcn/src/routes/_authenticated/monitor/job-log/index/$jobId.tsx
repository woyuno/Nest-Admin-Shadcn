import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/monitor/job-log/index/$jobId'
)({
  beforeLoad: () => {
    throw redirect({ to: '/monitor/job' })
  },
})
