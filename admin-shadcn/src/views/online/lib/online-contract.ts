export type OnlineUsersSearch = {
  page?: number
  pageSize?: number
  ipaddr?: string
  userName?: string
}

export type BackendOnlineUserItem = {
  tokenId: string
  userName: string
  deptName?: string
  ipaddr?: string
  loginLocation?: string
  browser?: string
  os?: string
  loginTime?: string | Date
}

function normalizeDate(value?: string | Date) {
  if (!value) return new Date(0)
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

export function buildListOnlineUsersParams(search: OnlineUsersSearch) {
  return {
    pageNum: 1,
    pageSize: 9999,
    ipaddr: search.ipaddr?.trim() || undefined,
    userName: search.userName?.trim() || undefined,
  }
}

export function mapBackendOnlineUserItem(item: BackendOnlineUserItem) {
  return {
    id: item.tokenId,
    tokenId: item.tokenId,
    userName: item.userName,
    deptName: item.deptName ?? '',
    ipaddr: item.ipaddr ?? '',
    loginLocation: item.loginLocation ?? '',
    browser: item.browser ?? '',
    os: item.os ?? '',
    loginTime: normalizeDate(item.loginTime),
  } as const
}

export function filterOnlineUsers(
  items: Array<ReturnType<typeof mapBackendOnlineUserItem>>,
  search: Pick<OnlineUsersSearch, 'ipaddr' | 'userName'>
) {
  const ipaddr = search.ipaddr?.trim()
  const userName = search.userName?.trim()

  return items.filter((item) => {
    const matchesIpaddr = ipaddr ? item.ipaddr.includes(ipaddr) : true
    const matchesUserName = userName ? item.userName.includes(userName) : true
    return matchesIpaddr && matchesUserName
  })
}
