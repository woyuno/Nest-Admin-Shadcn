import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/features/auth/lib/route-access'
import { Logininfor } from '@/features/logininfor'

const logininforSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  ipaddr: z.string().optional().catch(''),
  userName: z.string().optional().catch(''),
  status: z
    .array(z.union([z.literal('success'), z.literal('error')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/monitor/logininfor/')({
  validateSearch: logininforSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/monitor/logininfor')
  },
  component: Logininfor,
})
