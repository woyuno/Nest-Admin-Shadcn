import { request } from '@/lib/request'
import {
  buildExportLogininforPayload,
  buildListLogininforParams,
  mapBackendLogininforItem,
  type BackendLogininforItem,
  type LogininforSearch,
} from '../lib/logininfor-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendLogininforListResponse = {
  list: BackendLogininforItem[]
  total: number
}

export const logininforQueryKey = ['logininfor'] as const

export async function fetchLogininfor(search: LogininforSearch) {
  const response = await request.get<ApiEnvelope<BackendLogininforListResponse>>(
    '/monitor/logininfor/list',
    { params: buildListLogininforParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendLogininforItem),
    total: response.data.data.total || 0,
  }
}

export async function deleteLogininfor(ids: Array<number | string>) {
  await request.delete<ApiEnvelope<unknown>>(
    `/monitor/logininfor/${ids.join(',')}`
  )
}

export async function cleanLogininfor() {
  await request.delete<ApiEnvelope<unknown>>('/monitor/logininfor/clean')
}

export async function unlockLogininfor(userName: string) {
  await request.get<ApiEnvelope<unknown>>(
    `/monitor/logininfor/unlock/${encodeURIComponent(userName)}`
  )
}

export async function exportLogininfor(search: LogininforSearch) {
  const response = await request.get<Blob>('/monitor/logininfor/export', {
    params: buildExportLogininforPayload(search),
    responseType: 'blob',
  })

  return response.data
}
