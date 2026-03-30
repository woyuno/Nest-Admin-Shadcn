import { z } from 'zod'

export const noticeTypeSchema = z.union([
  z.literal('notice'),
  z.literal('announcement'),
])
export const noticeStatusSchema = z.union([
  z.literal('published'),
  z.literal('draft'),
])

const noticeSchema = z.object({
  id: z.string(),
  noticeId: z.number(),
  noticeTitle: z.string(),
  noticeType: noticeTypeSchema,
  status: noticeStatusSchema,
  createBy: z.string(),
  noticeContent: z.string(),
  createdAt: z.coerce.date(),
})

export type Notice = z.infer<typeof noticeSchema>
