import { request } from '@/lib/request'
import {
  buildExportOperlogPayload,
  buildListOperlogParams,
  mapBackendOperlogItem,
  type BackendOperlogItem,
  type OperlogSearch,
} from '../lib/operlog-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendOperlogListResponse = {
  list: BackendOperlogItem[]
  total: number
}

export const operlogQueryKey = ['operlog'] as const

export async function fetchOperlog(search: OperlogSearch) {
  const response = await request.get<ApiEnvelope<BackendOperlogListResponse>>(
    '/monitor/operlog/list',
    { params: buildListOperlogParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendOperlogItem),
    total: response.data.data.total || 0,
  }
}

export async function deleteOperlog(ids: Array<number | string>) {
  await request.delete<ApiEnvelope<unknown>>(`/monitor/operlog/${ids.join(',')}`)
}

export async function cleanOperlog() {
  await request.delete<ApiEnvelope<unknown>>('/monitor/operlog/clean')
}

export async function exportOperlog(search: OperlogSearch) {
  const response = await request.get<Blob>('/monitor/operlog/export', {
    params: buildExportOperlogPayload(search),
    responseType: 'blob',
  })

  return response.data
}
