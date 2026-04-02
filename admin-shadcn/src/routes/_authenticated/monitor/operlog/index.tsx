import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/views/auth/lib/route-access'
import { Operlog } from '@/views/operlog'

const operlogSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  title: z.string().optional().catch(''),
  operName: z.string().optional().catch(''),
  businessType: z
    .array(
      z.union([
        z.literal('0'),
        z.literal('1'),
        z.literal('2'),
        z.literal('3'),
        z.literal('4'),
        z.literal('5'),
        z.literal('6'),
        z.literal('7'),
        z.literal('8'),
        z.literal('9'),
      ])
    )
    .optional()
    .catch([]),
  status: z
    .array(z.union([z.literal('success'), z.literal('error')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/monitor/operlog/')({
  validateSearch: operlogSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/monitor/operlog')
  },
  component: Operlog,
})

