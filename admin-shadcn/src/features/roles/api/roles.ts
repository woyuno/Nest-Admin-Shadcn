import { request } from '@/lib/request'
import {
  buildListRolesParams,
  mapBackendRoleListItem,
  mapBackendRoleStatusFromEnabled,
  type BackendRoleListItem,
  type RolesSearch,
} from '../lib/role-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendRolesListResponse = {
  list: BackendRoleListItem[]
  total: number
}

type BackendTreeNode = {
  id: number
  label: string
  children?: BackendTreeNode[]
}

type BackendRoleDetail = {
  roleId: number
  roleName: string
  roleKey: string
  roleSort?: number
  status?: string
  dataScope?: string
  remark?: string
  menuCheckStrictly?: boolean
  deptCheckStrictly?: boolean
}

type BackendRoleMenuTreeResponse = {
  menus: BackendTreeNode[]
  checkedKeys: number[]
}

type BackendRoleDeptTreeResponse = {
  depts: BackendTreeNode[]
  checkedKeys: number[]
}

export const rolesQueryKey = ['roles'] as const

export async function fetchRoles(search: RolesSearch) {
  const response = await request.get<ApiEnvelope<BackendRolesListResponse>>(
    '/system/role/list',
    { params: buildListRolesParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendRoleListItem),
    total: response.data.data.total || 0,
  }
}

export async function fetchRoleDetail(roleId: number) {
  const response = await request.get<ApiEnvelope<BackendRoleDetail>>(
    `/system/role/${roleId}`
  )

  return response.data.data
}

export async function fetchMenuTree() {
  const response = await request.get<ApiEnvelope<BackendTreeNode[]>>(
    '/system/menu/treeselect'
  )

  return response.data.data || []
}

export async function fetchRoleMenuTree(roleId: number) {
  const response = await request.get<ApiEnvelope<BackendRoleMenuTreeResponse>>(
    `/system/menu/roleMenuTreeselect/${roleId}`
  )

  return response.data.data
}

export async function fetchRoleDeptTree(roleId: number) {
  const response = await request.get<ApiEnvelope<BackendRoleDeptTreeResponse>>(
    `/system/role/deptTree/${roleId}`
  )

  return response.data.data
}

export async function createRole(data: Record<string, unknown>) {
  await request.post('/system/role', data)
}

export async function updateRole(data: Record<string, unknown>) {
  await request.put('/system/role', data)
}

export async function updateRoleDataScope(data: Record<string, unknown>) {
  await request.put('/system/role/dataScope', data)
}

export async function changeRoleStatus(input: {
  roleId: number
  enabled: boolean
}) {
  await request.put('/system/role/changeStatus', {
    roleId: input.roleId,
    status: mapBackendRoleStatusFromEnabled(input.enabled),
  })
}

export async function deleteRole(roleId: number) {
  await request.delete(`/system/role/${roleId}`)
}

export async function deleteRoles(roleIds: number[]) {
  await request.delete(`/system/role/${roleIds.join(',')}`)
}

export async function exportRoles(search: RolesSearch) {
  const response = await request.post('/system/role/export', buildListRolesParams(search), {
    responseType: 'blob',
  })

  return response.data as Blob
}
