import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/views/auth/lib/route-access'
import { ExamplePage } from '@/views/examples'

const exampleSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  exampleName: z.string().optional().catch(''),
  status: z.array(z.union([z.literal('enabled'), z.literal('disabled')])).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/system/example/')({
  validateSearch: exampleSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/system/example')
  },
  component: ExamplePage,
})
