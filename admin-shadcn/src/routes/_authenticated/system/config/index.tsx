import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/views/auth/lib/route-access'
import { Configs } from '@/views/configs'

const configsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  configType: z
    .array(z.union([z.literal('builtIn'), z.literal('custom')]))
    .optional()
    .catch([]),
  configName: z.string().optional().catch(''),
  configKey: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/system/config/')({
  validateSearch: configsSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/system/config')
  },
  component: Configs,
})

