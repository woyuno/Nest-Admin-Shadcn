import { z } from 'zod'

export const roleStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type RoleStatus = z.infer<typeof roleStatusSchema>

const roleSchema = z.object({
  id: z.string(),
  roleId: z.number(),
  roleName: z.string(),
  roleKey: z.string(),
  roleSort: z.number(),
  status: roleStatusSchema,
  remark: z.string().optional(),
  createdAt: z.coerce.date(),
})

export type Role = z.infer<typeof roleSchema>
