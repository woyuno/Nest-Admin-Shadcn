type RolesSearch = {
  page?: number
  pageSize?: number
  roleName?: string
  roleKey?: string
  status?: Array<'active' | 'inactive'>
  beginTime?: string
  endTime?: string
}

type BackendRoleListItem = {
  roleId: number
  roleName: string
  roleKey: string
  roleSort: number
  status: '0' | '1'
  createTime?: string | Date
}

function normalizeDate(value?: string | Date) {
  if (!value) return new Date(0)
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

export function buildListRolesParams(search: RolesSearch) {
  const nextStatus = search.status?.[0]
  const beginTime = search.beginTime?.trim()
  const endTime = search.endTime?.trim()
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    roleName: search.roleName?.trim() || undefined,
    roleKey: search.roleKey?.trim() || undefined,
    status: nextStatus === 'active' ? '0' : nextStatus === 'inactive' ? '1' : undefined,
    params:
      beginTime || endTime
        ? {
            beginTime: beginTime || undefined,
            endTime: endTime || undefined,
          }
        : undefined,
  }
}

export function mapBackendRoleStatusFromEnabled(enabled: boolean) {
  return enabled ? '0' : '1'
}

export function mapBackendRoleListItem(role: BackendRoleListItem) {
  return {
    id: String(role.roleId),
    roleId: role.roleId,
    roleName: role.roleName,
    roleKey: role.roleKey,
    roleSort: role.roleSort,
    status: role.status === '0' ? 'active' : 'inactive',
    createdAt: normalizeDate(role.createTime),
  } as const
}

export type { BackendRoleListItem, RolesSearch }
