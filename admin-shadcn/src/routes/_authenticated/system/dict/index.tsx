import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/views/auth/lib/route-access'
import { Dicts } from '@/views/dicts'

const dictsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  dictName: z.string().optional().catch(''),
  dictType: z.string().optional().catch(''),
  typeStatus: z
    .array(z.union([z.literal('active'), z.literal('inactive')]))
    .optional()
    .catch([]),
  dictLabel: z.string().optional().catch(''),
  dataStatus: z
    .array(z.union([z.literal('active'), z.literal('inactive')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/system/dict/')({
  validateSearch: dictsSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/system/dict')
  },
  component: Dicts,
})

