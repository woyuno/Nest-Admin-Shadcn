export type LogininforSearch = {
  page?: number
  pageSize?: number
  ipaddr?: string
  userName?: string
  status?: Array<'success' | 'error'>
}

export type BackendLogininforItem = {
  infoId: number
  userName?: string
  ipaddr?: string
  loginLocation?: string
  browser?: string
  os?: string
  status?: '0' | '1'
  msg?: string
  loginTime?: string | Date
}

function normalizeDate(value?: string | Date) {
  if (!value) return new Date(0)
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function mapStatusToBackend(
  status?: Array<'success' | 'error'> | 'success' | 'error'
) {
  const nextStatus = Array.isArray(status) ? status[0] : status
  return nextStatus === 'success' ? '0' : nextStatus === 'error' ? '1' : undefined
}

export function buildListLogininforParams(search: LogininforSearch) {
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    ipaddr: search.ipaddr?.trim() || undefined,
    userName: search.userName?.trim() || undefined,
    status: mapStatusToBackend(search.status),
  }
}

export function buildExportLogininforPayload(search: LogininforSearch) {
  return {
    ipaddr: search.ipaddr?.trim() || undefined,
    userName: search.userName?.trim() || undefined,
    status: mapStatusToBackend(search.status),
  }
}

export function mapBackendLogininforItem(item: BackendLogininforItem) {
  return {
    id: String(item.infoId),
    infoId: item.infoId,
    userName: item.userName ?? '',
    ipaddr: item.ipaddr ?? '',
    loginLocation: item.loginLocation ?? '',
    browser: item.browser ?? '',
    os: item.os ?? '',
    status: item.status === '1' ? 'error' : 'success',
    msg: item.msg ?? '',
    loginTime: normalizeDate(item.loginTime),
  } as const
}
