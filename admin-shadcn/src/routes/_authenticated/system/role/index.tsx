import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/views/auth/lib/route-access'
import { Roles } from '@/views/roles'

const rolesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  roleName: z.string().optional().catch(''),
  roleKey: z.string().optional().catch(''),
  beginTime: z.string().optional().catch(''),
  endTime: z.string().optional().catch(''),
  status: z
    .array(z.union([z.literal('active'), z.literal('inactive')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/system/role/')({
  validateSearch: rolesSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/system/role')
  },
  component: Roles,
})

