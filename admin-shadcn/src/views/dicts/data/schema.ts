import { z } from 'zod'

export const dictStatusSchema = z.union([z.literal('active'), z.literal('inactive')])

const dictTypeSchema = z.object({
  id: z.string(),
  dictId: z.number(),
  dictName: z.string(),
  dictType: z.string(),
  status: dictStatusSchema,
  remark: z.string(),
  createdAt: z.coerce.date(),
})

const dictDataSchema = z.object({
  id: z.string(),
  dictCode: z.number(),
  dictSort: z.number(),
  dictLabel: z.string(),
  dictValue: z.string(),
  dictType: z.string(),
  cssClass: z.string(),
  listClass: z.string(),
  status: dictStatusSchema,
  remark: z.string(),
  createdAt: z.coerce.date(),
})

export type DictType = z.infer<typeof dictTypeSchema>
export type DictData = z.infer<typeof dictDataSchema>
