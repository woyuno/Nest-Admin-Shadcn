import { z } from 'zod'

const onlineUserSchema = z.object({
  id: z.string(),
  tokenId: z.string(),
  userName: z.string(),
  deptName: z.string(),
  ipaddr: z.string(),
  loginLocation: z.string(),
  browser: z.string(),
  os: z.string(),
  loginTime: z.coerce.date(),
})

export type OnlineUser = z.infer<typeof onlineUserSchema>
