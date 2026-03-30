export type PostsSearch = {
  page?: number
  pageSize?: number
  postCode?: string
  postName?: string
  status?: Array<'active' | 'inactive'>
}

export type BackendPostListItem = {
  postId: number
  postCode: string
  postName: string
  postSort: number
  status: '0' | '1'
  remark?: string
  createTime?: string | Date
}

export type BackendPostDetail = {
  postId?: number
  postCode?: string
  postName?: string
  postSort?: number
  status?: '0' | '1'
  remark?: string
}

export type PostFormValues = {
  postId?: number
  postCode: string
  postName: string
  postSort: number
  status: 'active' | 'inactive'
  remark: string
}

function normalizeDate(value?: string | Date) {
  if (!value) return new Date(0)
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function mapStatusToBackend(status?: Array<'active' | 'inactive'> | 'active' | 'inactive') {
  const nextStatus = Array.isArray(status) ? status[0] : status
  return nextStatus === 'active' ? '0' : nextStatus === 'inactive' ? '1' : undefined
}

export function buildListPostsParams(search: PostsSearch) {
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    postCode: search.postCode?.trim() || undefined,
    postName: search.postName?.trim() || undefined,
    status: mapStatusToBackend(search.status),
  }
}

export function buildExportPostsPayload(search: PostsSearch) {
  return {
    postCode: search.postCode?.trim() || undefined,
    postName: search.postName?.trim() || undefined,
    status: mapStatusToBackend(search.status),
  }
}

export function mapBackendPostListItem(post: BackendPostListItem) {
  return {
    id: String(post.postId),
    postId: post.postId,
    postCode: post.postCode,
    postName: post.postName,
    postSort: post.postSort,
    status: post.status === '0' ? 'active' : 'inactive',
    remark: post.remark ?? '',
    createdAt: normalizeDate(post.createTime),
  } as const
}

export function buildPostFormDefaults(detail: BackendPostDetail): PostFormValues {
  return {
    postId: detail.postId,
    postCode: detail.postCode ?? '',
    postName: detail.postName ?? '',
    postSort: detail.postSort ?? 0,
    status: detail.status === '1' ? 'inactive' : 'active',
    remark: detail.remark ?? '',
  }
}

export function buildPostSavePayload(values: PostFormValues) {
  return {
    postId: values.postId,
    postCode: values.postCode.trim(),
    postName: values.postName.trim(),
    postSort: Number(values.postSort),
    status: values.status === 'active' ? '0' : '1',
    remark: values.remark.trim() || undefined,
  }
}
