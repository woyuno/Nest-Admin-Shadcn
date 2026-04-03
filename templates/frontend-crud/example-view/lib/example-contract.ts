export type ExampleSearch = {
  page?: number
  pageSize?: number
  exampleName?: string
  status?: Array<'enabled' | 'disabled'>
}

export type BackendExampleListItem = {
  exampleId: number
  exampleName: string
  status: '0' | '1'
  remark?: string
  createTime?: string | Date
}

function normalizeDate(value?: string | Date) {
  if (!value) return new Date(0)
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function mapExampleStatusToBackend(
  status?: Array<'enabled' | 'disabled'> | 'enabled' | 'disabled'
) {
  const nextStatus = Array.isArray(status) ? status[0] : status
  return nextStatus === 'enabled'
    ? '0'
    : nextStatus === 'disabled'
      ? '1'
      : undefined
}

export function buildListExamplesParams(search: ExampleSearch) {
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    exampleName: search.exampleName?.trim() || undefined,
    status: mapExampleStatusToBackend(search.status),
  }
}

export function mapBackendExampleListItem(example: BackendExampleListItem) {
  return {
    id: String(example.exampleId),
    exampleId: example.exampleId,
    exampleName: example.exampleName,
    status: example.status === '0' ? 'enabled' : 'disabled',
    remark: example.remark ?? '',
    createdAt: normalizeDate(example.createTime),
  } as const
}
