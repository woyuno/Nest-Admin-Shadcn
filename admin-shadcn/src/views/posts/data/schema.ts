import { z } from 'zod'

export const postStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type PostStatus = z.infer<typeof postStatusSchema>

const postSchema = z.object({
  id: z.string(),
  postId: z.number(),
  postCode: z.string(),
  postName: z.string(),
  postSort: z.number(),
  status: postStatusSchema,
  remark: z.string(),
  createdAt: z.coerce.date(),
})

export type Post = z.infer<typeof postSchema>
