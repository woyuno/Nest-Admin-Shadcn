export type ConfigsSearch = {
  page?: number
  pageSize?: number
  configName?: string
  configKey?: string
  configType?: Array<'builtIn' | 'custom'>
}

export type BackendConfigListItem = {
  configId: number
  configName: string
  configKey: string
  configValue: string
  configType: 'Y' | 'N'
  remark?: string
  createTime?: string | Date
}

export type BackendConfigDetail = {
  configId?: number
  configName?: string
  configKey?: string
  configValue?: string
  configType?: 'Y' | 'N'
  remark?: string
}

export type ConfigFormValues = {
  configId?: number
  configName: string
  configKey: string
  configValue: string
  configType: 'builtIn' | 'custom'
  remark: string
}

function normalizeDate(value?: string | Date) {
  if (!value) return new Date(0)
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function mapConfigTypeToBackend(
  configType?: Array<'builtIn' | 'custom'> | 'builtIn' | 'custom'
) {
  const nextConfigType = Array.isArray(configType) ? configType[0] : configType
  return nextConfigType === 'builtIn'
    ? 'Y'
    : nextConfigType === 'custom'
      ? 'N'
      : undefined
}

export function buildListConfigsParams(search: ConfigsSearch) {
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    configName: search.configName?.trim() || undefined,
    configKey: search.configKey?.trim() || undefined,
    configType: mapConfigTypeToBackend(search.configType),
  }
}

export function buildExportConfigsPayload(search: ConfigsSearch) {
  return {
    configName: search.configName?.trim() || undefined,
    configKey: search.configKey?.trim() || undefined,
    configType: mapConfigTypeToBackend(search.configType),
  }
}

export function mapBackendConfigListItem(config: BackendConfigListItem) {
  return {
    id: String(config.configId),
    configId: config.configId,
    configName: config.configName,
    configKey: config.configKey,
    configValue: config.configValue,
    configType: config.configType === 'Y' ? 'builtIn' : 'custom',
    remark: config.remark ?? '',
    createdAt: normalizeDate(config.createTime),
  } as const
}

export function buildConfigFormDefaults(detail: BackendConfigDetail): ConfigFormValues {
  return {
    configId: detail.configId,
    configName: detail.configName ?? '',
    configKey: detail.configKey ?? '',
    configValue: detail.configValue ?? '',
    configType: detail.configType === 'N' ? 'custom' : 'builtIn',
    remark: detail.remark ?? '',
  }
}

export function buildConfigSavePayload(values: ConfigFormValues) {
  return {
    configId: values.configId,
    configName: values.configName.trim(),
    configKey: values.configKey.trim(),
    configValue: values.configValue.trim(),
    configType: values.configType === 'builtIn' ? 'Y' : 'N',
    remark: values.remark.trim() || undefined,
  }
}
