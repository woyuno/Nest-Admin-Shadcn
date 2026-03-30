import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/features/auth/lib/route-access'
import { Posts } from '@/features/posts'

const postsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.union([z.literal('active'), z.literal('inactive')]))
    .optional()
    .catch([]),
  postCode: z.string().optional().catch(''),
  postName: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/system/post/')({
  validateSearch: postsSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/system/post')
  },
  component: Posts,
})
