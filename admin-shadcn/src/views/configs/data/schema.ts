import { z } from 'zod'

export const configTypeSchema = z.union([z.literal('builtIn'), z.literal('custom')])
export type ConfigType = z.infer<typeof configTypeSchema>

const configSchema = z.object({
  id: z.string(),
  configId: z.number(),
  configName: z.string(),
  configKey: z.string(),
  configValue: z.string(),
  configType: configTypeSchema,
  remark: z.string(),
  createdAt: z.coerce.date(),
})

export type Config = z.infer<typeof configSchema>
