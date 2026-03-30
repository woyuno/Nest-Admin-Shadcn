import { request } from '@/lib/request'
import {
  buildListOnlineUsersParams,
  filterOnlineUsers,
  mapBackendOnlineUserItem,
  type BackendOnlineUserItem,
  type OnlineUsersSearch,
} from '../lib/online-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendOnlineUsersResponse = {
  list: BackendOnlineUserItem[]
  total: number
}

export async function fetchOnlineUsers(search: OnlineUsersSearch) {
  const response = await request.get<ApiEnvelope<BackendOnlineUsersResponse>>(
    '/monitor/online/list',
    { params: buildListOnlineUsersParams(search) }
  )

  const mapped = (response.data.data.list || []).map(mapBackendOnlineUserItem)
  const filtered = filterOnlineUsers(mapped, search)
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? 10
  const start = (page - 1) * pageSize

  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
  }
}

export async function forceLogoutOnlineUser(tokenId: string) {
  await request.delete(`/monitor/online/${tokenId}`)
}
