import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { assertRouteAccess } from '@/features/auth/lib/route-access'
import { Menus } from '@/features/menus'

const menusSearchSchema = z.object({
  menuName: z.string().optional().catch(''),
  status: z
    .array(z.union([z.literal('active'), z.literal('inactive')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/system/menu/')({
  validateSearch: menusSearchSchema,
  beforeLoad: () => {
    assertRouteAccess('/system/menu')
  },
  component: Menus,
})
