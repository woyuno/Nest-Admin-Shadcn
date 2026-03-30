import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/features/auth/lib/route-access'
import { OnlineUsers } from '@/features/online'

const onlineUsersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  ipaddr: z.string().optional().catch(''),
  userName: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/monitor/online/')({
  validateSearch: onlineUsersSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/monitor/online')
  },
  component: OnlineUsers,
})
