import { request } from '@/lib/request'
import {
  buildDeptFormDefaults,
  buildDeptSavePayload,
  buildDeptTree,
  buildListDeptsParams,
  type BackendDeptDetail,
  type BackendDeptListItem,
  type DeptFormValues,
  type DeptsSearch,
} from '../lib/dept-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

export const deptsQueryKey = ['depts'] as const

export async function fetchDepts(search: DeptsSearch) {
  const response = await request.get<ApiEnvelope<BackendDeptListItem[]>>(
    '/system/dept/list',
    { params: buildListDeptsParams(search) }
  )

  return buildDeptTree(response.data.data || [])
}

export async function fetchDeptTreeOptions() {
  const response = await request.get<ApiEnvelope<BackendDeptListItem[]>>(
    '/system/dept/list'
  )

  return buildDeptTree(response.data.data || [])
}

export async function fetchDeptTreeOptionsExcludeChild(deptId: number) {
  const response = await request.get<ApiEnvelope<BackendDeptListItem[]>>(
    `/system/dept/list/exclude/${deptId}`
  )

  return buildDeptTree(response.data.data || [])
}

export async function fetchDeptDetail(deptId: number) {
  const response = await request.get<ApiEnvelope<BackendDeptDetail>>(
    `/system/dept/${deptId}`
  )

  return buildDeptFormDefaults(response.data.data || {})
}

export async function createDept(values: DeptFormValues) {
  await request.post<ApiEnvelope<unknown>>(
    '/system/dept',
    buildDeptSavePayload(values)
  )
}

export async function updateDept(values: DeptFormValues) {
  await request.put<ApiEnvelope<unknown>>(
    '/system/dept',
    buildDeptSavePayload(values)
  )
}

export async function deleteDept(deptId: number | string) {
  await request.delete<ApiEnvelope<unknown>>(`/system/dept/${deptId}`)
}
