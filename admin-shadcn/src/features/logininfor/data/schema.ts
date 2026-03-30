import { z } from 'zod'

export const logininforStatusSchema = z.union([
  z.literal('success'),
  z.literal('error'),
])

const logininforSchema = z.object({
  id: z.string(),
  infoId: z.number(),
  userName: z.string(),
  ipaddr: z.string(),
  loginLocation: z.string(),
  browser: z.string(),
  os: z.string(),
  status: logininforStatusSchema,
  msg: z.string(),
  loginTime: z.coerce.date(),
})

export type LogininforItem = z.infer<typeof logininforSchema>
