import { z } from 'zod'

export const operlogStatusSchema = z.union([
  z.literal('success'),
  z.literal('error'),
])

export const operlogBusinessTypeSchema = z.union([
  z.literal('0'),
  z.literal('1'),
  z.literal('2'),
  z.literal('3'),
  z.literal('4'),
  z.literal('5'),
  z.literal('6'),
  z.literal('7'),
  z.literal('8'),
  z.literal('9'),
])

const operlogSchema = z.object({
  id: z.string(),
  operId: z.number(),
  title: z.string(),
  businessType: operlogBusinessTypeSchema,
  operName: z.string(),
  operIp: z.string(),
  operLocation: z.string(),
  requestMethod: z.string(),
  operUrl: z.string(),
  method: z.string(),
  operParam: z.string(),
  jsonResult: z.string(),
  status: operlogStatusSchema,
  errorMsg: z.string(),
  costTime: z.number(),
  operTime: z.coerce.date(),
})

export type OperlogItem = z.infer<typeof operlogSchema>
