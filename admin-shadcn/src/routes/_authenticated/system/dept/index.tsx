import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/views/auth/lib/route-access'
import { Depts } from '@/views/depts'

const deptsSearchSchema = z.object({
  deptName: z.string().optional().catch(''),
  status: z
    .array(z.union([z.literal('active'), z.literal('inactive')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/system/dept/')({
  validateSearch: deptsSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/system/dept')
  },
  component: Depts,
})

