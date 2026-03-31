import { z } from 'zod'

export const menuStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export const menuVisibleSchema = z.union([z.literal('show'), z.literal('hide')])
export const menuTypeSchema = z.union([
  z.literal('directory'),
  z.literal('menu'),
  z.literal('button'),
])
export const menuFrameSchema = z.union([z.literal('yes'), z.literal('no')])
export const menuCacheSchema = z.union([z.literal('cache'), z.literal('noCache')])

const menuSchema = z.object({
  id: z.string(),
  menuId: z.number(),
  parentId: z.number(),
  menuName: z.string(),
  orderNum: z.number(),
  path: z.string(),
  component: z.string(),
  query: z.string(),
  isFrame: menuFrameSchema,
  isCache: menuCacheSchema,
  visible: menuVisibleSchema,
  status: menuStatusSchema,
  menuType: menuTypeSchema,
  perms: z.string(),
  icon: z.string(),
  createdAt: z.coerce.date(),
})

export type Menu = z.infer<typeof menuSchema>
