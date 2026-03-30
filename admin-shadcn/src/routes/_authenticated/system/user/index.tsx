import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/features/auth/lib/route-access'
import { Users } from '@/features/users'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  deptId: z.string().optional().catch(''),
  status: z
    .array(z.union([z.literal('active'), z.literal('inactive')]))
    .optional()
    .catch([]),
  username: z.string().optional().catch(''),
  phonenumber: z.string().optional().catch(''),
  beginTime: z.string().optional().catch(''),
  endTime: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/system/user/')({
  validateSearch: usersSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/system/user')
  },
  component: Users,
})
