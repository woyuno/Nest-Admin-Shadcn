import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/features/auth/lib/route-access'
import { Notices } from '@/features/notices'

const noticesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  noticeType: z
    .array(z.union([z.literal('notice'), z.literal('announcement')]))
    .optional()
    .catch([]),
  noticeTitle: z.string().optional().catch(''),
  createBy: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/system/notice/')({
  validateSearch: noticesSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/system/notice')
  },
  component: Notices,
})
