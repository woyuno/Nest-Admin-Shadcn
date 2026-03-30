import { request } from '@/lib/request'
import {
  buildExportUsersPayload,
  buildListUsersParams,
  mapBackendStatusFromEnabled,
  mapBackendUserListItem,
  type BackendUserListItem,
  type UsersSearch,
} from '../lib/user-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendUsersListResponse = {
  list: BackendUserListItem[]
  total: number
}

type BackendUserDetailResponse = {
  data: {
    userId: number
    userName: string
    nickName: string
    deptId?: number
    phonenumber?: string
    email?: string
    sex?: string
    status?: string
    remark?: string
  }
  postIds?: number[]
  roleIds?: number[]
  posts?: Array<{ postId: number; postName: string; status?: string | number }>
  roles?: Array<{ roleId: number; roleName: string; status?: string | number }>
}

type BackendUserMetaResponse = {
  posts?: Array<{ postId: number; postName: string; status?: string | number }>
  roles?: Array<{ roleId: number; roleName: string; status?: string | number }>
}

type BackendDeptTreeNode = {
  id: number
  label: string
  children?: BackendDeptTreeNode[]
}

type BackendUserAuthRoleItem = {
  roleId: number
  roleName: string
  status?: string | number
  flag?: boolean
}

type BackendUserAuthRoleResponse = {
  roles?: BackendUserAuthRoleItem[]
  user: {
    userId: number
    userName: string
    nickName?: string
    roles?: BackendUserAuthRoleItem[]
  }
}

export const usersQueryKey = ['users'] as const

export async function fetchUsers(search: UsersSearch) {
  const response = await request.get<ApiEnvelope<BackendUsersListResponse>>(
    '/system/user/list',
    {
      params: buildListUsersParams(search),
    }
  )

  const data = response.data.data

  return {
    list: (data.list || []).map(mapBackendUserListItem),
    total: data.total || 0,
  }
}

export async function changeUserStatus(input: {
  userId: number
  enabled: boolean
}) {
  await request.put('/system/user/changeStatus', {
    userId: input.userId,
    status: mapBackendStatusFromEnabled(input.enabled),
  })
}

export async function deleteUser(userId: number) {
  await request.delete(`/system/user/${userId}`)
}

export async function deleteUsers(userIds: number[]) {
  await request.delete(`/system/user/${userIds.join(',')}`)
}

export async function exportUsers(search: UsersSearch) {
  const response = await request.post('/system/user/export', buildExportUsersPayload(search), {
    responseType: 'blob',
  })

  return response.data as Blob
}

export async function fetchUserMeta() {
  const response = await request.get<ApiEnvelope<BackendUserMetaResponse>>(
    '/system/user'
  )

  return response.data.data
}

export async function fetchUserDetail(userId: number) {
  const response = await request.get<ApiEnvelope<BackendUserDetailResponse>>(
    `/system/user/${userId}`
  )

  return response.data.data
}

export async function fetchUserDeptTree() {
  const response = await request.get<ApiEnvelope<BackendDeptTreeNode[]>>(
    '/system/user/deptTree'
  )

  return response.data.data || []
}

export async function resetUserPassword(input: {
  userId: number
  password: string
}) {
  await request.put('/system/user/resetPwd', input)
}

export async function fetchUserAuthRoles(userId: number) {
  const response = await request.get<ApiEnvelope<BackendUserAuthRoleResponse>>(
    `/system/user/authRole/${userId}`
  )

  return response.data.data
}

export async function updateUserAuthRoles(input: {
  userId: number
  roleIds: number[]
}) {
  await request.put('/system/user/authRole', undefined, {
    params: {
      userId: input.userId,
      roleIds: input.roleIds.join(','),
    },
  })
}

export async function createUser(data: Record<string, unknown>) {
  await request.post('/system/user', data)
}

export async function updateUser(data: Record<string, unknown>) {
  await request.put('/system/user', data)
}
