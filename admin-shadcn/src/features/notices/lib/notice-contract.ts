export type NoticesSearch = {
  page?: number
  pageSize?: number
  noticeTitle?: string
  createBy?: string
  noticeType?: Array<'notice' | 'announcement'>
}

export type BackendNoticeListItem = {
  noticeId: number
  noticeTitle: string
  noticeType: '1' | '2'
  status: '0' | '1'
  createBy?: string
  noticeContent?: string
  createTime?: string | Date
}

export type BackendNoticeDetail = {
  noticeId?: number
  noticeTitle?: string
  noticeType?: '1' | '2'
  status?: '0' | '1'
  noticeContent?: string
}

export type NoticeFormValues = {
  noticeId?: number
  noticeTitle: string
  noticeType: 'notice' | 'announcement'
  status: 'published' | 'draft'
  noticeContent: string
}

function normalizeDate(value?: string | Date) {
  if (!value) return new Date(0)
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function mapNoticeTypeToBackend(
  noticeType?: Array<'notice' | 'announcement'> | 'notice' | 'announcement'
) {
  const nextNoticeType = Array.isArray(noticeType) ? noticeType[0] : noticeType
  return nextNoticeType === 'notice'
    ? '1'
    : nextNoticeType === 'announcement'
      ? '2'
      : undefined
}

function mapNoticeStatusToBackend(status?: 'published' | 'draft') {
  return status === 'published' ? '0' : status === 'draft' ? '1' : undefined
}

export function buildListNoticesParams(search: NoticesSearch) {
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    noticeTitle: search.noticeTitle?.trim() || undefined,
    createBy: search.createBy?.trim() || undefined,
    noticeType: mapNoticeTypeToBackend(search.noticeType),
  }
}

export function mapBackendNoticeListItem(notice: BackendNoticeListItem) {
  return {
    id: String(notice.noticeId),
    noticeId: notice.noticeId,
    noticeTitle: notice.noticeTitle,
    noticeType: notice.noticeType === '1' ? 'notice' : 'announcement',
    status: notice.status === '0' ? 'published' : 'draft',
    createBy: notice.createBy ?? '',
    noticeContent: notice.noticeContent ?? '',
    createdAt: normalizeDate(notice.createTime),
  } as const
}

export function buildNoticeFormDefaults(detail: BackendNoticeDetail): NoticeFormValues {
  return {
    noticeId: detail.noticeId,
    noticeTitle: detail.noticeTitle ?? '',
    noticeType: detail.noticeType === '2' ? 'announcement' : 'notice',
    status: detail.status === '1' ? 'draft' : 'published',
    noticeContent: detail.noticeContent ?? '',
  }
}

export function buildNoticeSavePayload(values: NoticeFormValues) {
  return {
    noticeId: values.noticeId,
    noticeTitle: values.noticeTitle.trim(),
    noticeType: mapNoticeTypeToBackend(values.noticeType),
    status: mapNoticeStatusToBackend(values.status),
    noticeContent: values.noticeContent.trim(),
  }
}
