import { request } from '@/lib/request'
import {
  buildDictDataFormDefaults,
  buildDictDataSavePayload,
  buildDictDataSearchParams,
  buildDictTypeFormDefaults,
  buildDictTypeSavePayload,
  buildDictTypeSearchParams,
  mapBackendDictDataItem,
  mapBackendDictTypeItem,
  type BackendDictDataDetail,
  type BackendDictDataItem,
  type BackendDictTypeDetail,
  type BackendDictTypeItem,
  type DictDataFormValues,
  type DictDataSearch,
  type DictTypeFormValues,
  type DictTypeSearch,
} from '../lib/dict-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendListResponse<T> = {
  list: T[]
  total: number
}

export const dictsQueryKey = ['dicts'] as const

export async function fetchDictTypes(search: DictTypeSearch) {
  const response = await request.get<ApiEnvelope<BackendListResponse<BackendDictTypeItem>>>(
    '/system/dict/type/list',
    { params: buildDictTypeSearchParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendDictTypeItem),
    total: response.data.data.total || 0,
  }
}

export async function fetchDictTypeDetail(dictId: number) {
  const response = await request.get<ApiEnvelope<BackendDictTypeDetail>>(
    `/system/dict/type/${dictId}`
  )

  return buildDictTypeFormDefaults(response.data.data || {})
}

export async function createDictType(values: DictTypeFormValues) {
  await request.post('/system/dict/type', buildDictTypeSavePayload(values))
}

export async function updateDictType(values: DictTypeFormValues) {
  await request.put('/system/dict/type', buildDictTypeSavePayload(values))
}

export async function deleteDictType(dictId: number | string) {
  await request.delete(`/system/dict/type/${dictId}`)
}

export async function refreshDictCache() {
  await request.delete('/system/dict/type/refreshCache')
}

export async function exportDictTypes(search: DictTypeSearch) {
  const response = await request.post(
    '/system/dict/type/export',
    buildDictTypeSearchParams(search),
    { responseType: 'blob' }
  )

  return response.data as Blob
}

export async function fetchDictData(search: DictDataSearch) {
  const response = await request.get<ApiEnvelope<BackendListResponse<BackendDictDataItem>>>(
    '/system/dict/data/list',
    { params: buildDictDataSearchParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendDictDataItem),
    total: response.data.data.total || 0,
  }
}

export async function fetchDictDataDetail(dictCode: number) {
  const response = await request.get<ApiEnvelope<BackendDictDataDetail>>(
    `/system/dict/data/${dictCode}`
  )

  return buildDictDataFormDefaults(response.data.data || {})
}

export async function createDictData(values: DictDataFormValues) {
  await request.post('/system/dict/data', buildDictDataSavePayload(values))
}

export async function updateDictData(values: DictDataFormValues) {
  await request.put('/system/dict/data', buildDictDataSavePayload(values))
}

export async function deleteDictData(dictCode: number | string) {
  await request.delete(`/system/dict/data/${dictCode}`)
}

export async function exportDictData(search: DictDataSearch) {
  const response = await request.post(
    '/system/dict/data/export',
    buildDictDataSearchParams(search),
    { responseType: 'blob' }
  )

  return response.data as Blob
}
