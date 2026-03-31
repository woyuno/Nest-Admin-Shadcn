import { request } from '@/lib/request'
import {
  buildConfigFormDefaults,
  buildConfigSavePayload,
  buildExportConfigsPayload,
  buildListConfigsParams,
  mapBackendConfigListItem,
  type BackendConfigDetail,
  type BackendConfigListItem,
  type ConfigFormValues,
  type ConfigsSearch,
} from '../lib/config-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendConfigsListResponse = {
  list: BackendConfigListItem[]
  total: number
}

export const configsQueryKey = ['configs'] as const
export const configDetailQueryKey = (configId?: number) =>
  ['configs', 'detail', configId] as const

export async function fetchConfigs(search: ConfigsSearch) {
  const response = await request.get<ApiEnvelope<BackendConfigsListResponse>>(
    '/system/config/list',
    { params: buildListConfigsParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendConfigListItem),
    total: response.data.data.total || 0,
  }
}

export async function fetchConfigDetail(configId: number) {
  const response = await request.get<ApiEnvelope<BackendConfigDetail>>(
    `/system/config/${configId}`
  )

  return buildConfigFormDefaults(response.data.data || {})
}

export async function createConfig(values: ConfigFormValues) {
  await request.post<ApiEnvelope<unknown>>(
    '/system/config',
    buildConfigSavePayload(values)
  )
}

export async function updateConfig(values: ConfigFormValues) {
  await request.put<ApiEnvelope<unknown>>(
    '/system/config',
    buildConfigSavePayload(values)
  )
}

export async function deleteConfig(configId: number | string) {
  await request.delete<ApiEnvelope<unknown>>(`/system/config/${configId}`)
}

export async function deleteConfigs(configIds: Array<number | string>) {
  await request.delete<ApiEnvelope<unknown>>(
    `/system/config/${configIds.join(',')}`
  )
}

export async function refreshConfigsCache() {
  await request.delete<ApiEnvelope<unknown>>('/system/config/refreshCache')
}

export async function exportConfigs(search: ConfigsSearch) {
  const response = await request.get<Blob>('/system/config/export', {
    params: buildExportConfigsPayload(search),
    responseType: 'blob',
  })

  return response.data
}
