import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/features/auth/lib/route-access'
import { GenTables } from '@/features/gen'

const genSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  tableName: z.string().optional().catch(''),
  tableComment: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/tool/gen/')({
  validateSearch: genSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/tool/gen')
  },
  component: GenTables,
})
