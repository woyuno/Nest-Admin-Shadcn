type UsersSearch = {
  page?: number
  pageSize?: number
  deptId?: string
  username?: string
  phonenumber?: string
  status?: Array<'active' | 'inactive'>
  beginTime?: string
  endTime?: string
}

type BackendUserListItem = {
  userId: number
  userName: string
  nickName: string
  email?: string
  phonenumber?: string
  status: '0' | '1'
  dept?: {
    deptName?: string
  } | null
  createTime?: string | Date
  updateTime?: string | Date
}

const backendStatusMap = {
  active: '0',
  inactive: '1',
} as const

export function stripWrappedQuotes(value?: string) {
  if (!value) {
    return ''
  }

  return value.replace(/^"(.*)"$/, '$1')
}

export function mapBackendStatusFromEnabled(enabled: boolean) {
  return enabled ? '0' : '1'
}

function normalizeDate(value?: string | Date) {
  if (!value) {
    return new Date(0)
  }

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

export function buildListUsersParams(search: UsersSearch) {
  const nextStatus = search.status?.[0]
  const beginTime = search.beginTime?.trim()
  const endTime = search.endTime?.trim()

  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    deptId: search.deptId?.trim() || undefined,
    userName: stripWrappedQuotes(search.username).trim() || undefined,
    phonenumber: stripWrappedQuotes(search.phonenumber).trim() || undefined,
    status: nextStatus ? backendStatusMap[nextStatus] : undefined,
    params:
      beginTime || endTime
        ? {
            beginTime: beginTime || undefined,
            endTime: endTime || undefined,
          }
        : undefined,
  }
}

export function buildExportUsersPayload(search: UsersSearch) {
  const { pageNum: _pageNum, pageSize: _pageSize, ...rest } =
    buildListUsersParams(search)

  return rest
}

export function mapBackendUserListItem(user: BackendUserListItem) {
  const role = user.userId === 1 ? 'superadmin' : 'admin'

  return {
    id: String(user.userId),
    userId: user.userId,
    userName: user.userName,
    nickName: user.nickName,
    deptName: user.dept?.deptName ?? '未分配部门',
    username: user.userName,
    firstName: user.nickName,
    lastName: '',
    email: user.email || '-',
    phoneNumber: user.phonenumber || '-',
    phonenumber: user.phonenumber || '-',
    status: user.status === '0' ? 'active' : 'inactive',
    role,
    createdAt: normalizeDate(user.createTime),
    updatedAt: normalizeDate(user.updateTime ?? user.createTime),
  } as const
}

export type { BackendUserListItem, UsersSearch }
