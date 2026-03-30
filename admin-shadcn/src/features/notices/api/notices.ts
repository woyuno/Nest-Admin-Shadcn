import { request } from '@/lib/request'
import {
  buildListNoticesParams,
  buildNoticeFormDefaults,
  buildNoticeSavePayload,
  mapBackendNoticeListItem,
  type BackendNoticeDetail,
  type BackendNoticeListItem,
  type NoticeFormValues,
  type NoticesSearch,
} from '../lib/notice-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendNoticesListResponse = {
  list: BackendNoticeListItem[]
  total: number
}

export const noticesQueryKey = ['notices'] as const

export async function fetchNotices(search: NoticesSearch) {
  const response = await request.get<ApiEnvelope<BackendNoticesListResponse>>(
    '/system/notice/list',
    { params: buildListNoticesParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendNoticeListItem),
    total: response.data.data.total || 0,
  }
}

export async function fetchNoticeDetail(noticeId: number) {
  const response = await request.get<ApiEnvelope<BackendNoticeDetail>>(
    `/system/notice/${noticeId}`
  )

  return buildNoticeFormDefaults(response.data.data || {})
}

export async function createNotice(values: NoticeFormValues) {
  await request.post<ApiEnvelope<unknown>>(
    '/system/notice',
    buildNoticeSavePayload(values)
  )
}

export async function updateNotice(values: NoticeFormValues) {
  await request.put<ApiEnvelope<unknown>>(
    '/system/notice',
    buildNoticeSavePayload(values)
  )
}

export async function deleteNotice(noticeId: number | string) {
  await request.delete<ApiEnvelope<unknown>>(`/system/notice/${noticeId}`)
}

export async function deleteNotices(noticeIds: Array<number | string>) {
  await request.delete<ApiEnvelope<unknown>>(
    `/system/notice/${noticeIds.join(',')}`
  )
}
