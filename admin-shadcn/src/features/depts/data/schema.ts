import { z } from 'zod'

export const deptStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type DeptStatus = z.infer<typeof deptStatusSchema>

const deptSchema = z.object({
  id: z.string(),
  deptId: z.number(),
  parentId: z.number(),
  deptName: z.string(),
  orderNum: z.number(),
  leader: z.string(),
  phone: z.string(),
  email: z.string(),
  status: deptStatusSchema,
  createdAt: z.coerce.date(),
})

export type Dept = z.infer<typeof deptSchema>
