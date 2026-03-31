import { request } from '@/lib/request'
import {
  buildListGenTablesParams,
  mapBackendGenTableItem,
  type BackendGenTableItem,
  type GenTableSearch,
} from '../lib/gen-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendGenTableResponse = {
  list: BackendGenTableItem[]
  total: number
}

export const genTablesQueryKey = ['gen-tables'] as const

export async function fetchGenTables(search: GenTableSearch) {
  const response = await request.get<ApiEnvelope<BackendGenTableResponse>>(
    '/tool/gen/list',
    { params: buildListGenTablesParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendGenTableItem),
    total: response.data.data.total || 0,
  }
}

export async function previewGenTable(tableId: number) {
  const response = await request.get<ApiEnvelope<Record<string, string>>>(
    `/tool/gen/preview/${tableId}`
  )

  return response.data.data || {}
}

export async function deleteGenTable(tableId: number | string) {
  await request.delete<ApiEnvelope<unknown>>(`/tool/gen/${tableId}`)
}

export async function syncGenTable(tableName: string) {
  await request.get<ApiEnvelope<unknown>>(
    `/tool/gen/synchDb/${encodeURIComponent(tableName)}`
  )
}

export async function genCode(tableName: string) {
  const response = await request.get<Blob>(
    `/tool/gen/batchGenCode/zip?tableNames=${encodeURIComponent(tableName)}`,
    { responseType: 'blob' }
  )

  return response.data
}
