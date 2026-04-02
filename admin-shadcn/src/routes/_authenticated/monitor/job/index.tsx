import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/views/auth/lib/route-access'
import { Tasks } from '@/views/tasks'

const tasksSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  jobName: z.string().optional().catch(''),
  jobGroup: z
    .array(z.union([z.literal('DEFAULT'), z.literal('SYSTEM')]))
    .optional()
    .catch([]),
  status: z
    .array(z.union([z.literal('active'), z.literal('paused')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/monitor/job/')({
  validateSearch: tasksSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/monitor/job')
  },
  component: Tasks,
})

