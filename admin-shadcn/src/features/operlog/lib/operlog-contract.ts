export type OperlogSearch = {
  page?: number
  pageSize?: number
  title?: string
  operName?: string
  businessType?: Array<OperlogBusinessType>
  status?: Array<'success' | 'error'>
}

export type OperlogBusinessType =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'

export type BackendOperlogItem = {
  operId: number
  title?: string
  businessType?: OperlogBusinessType
  operName?: string
  operIp?: string
  operLocation?: string
  requestMethod?: string
  operUrl?: string
  method?: string
  operParam?: string
  jsonResult?: string
  status?: '0' | '1'
  errorMsg?: string
  costTime?: number
  operTime?: string | Date
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

function mapBusinessTypeToBackend(
  businessType?: Array<OperlogBusinessType> | OperlogBusinessType
) {
  return Array.isArray(businessType) ? businessType[0] : businessType
}

export const operlogBusinessTypeOptions = [
  { label: '其它', value: '0' },
  { label: '新增', value: '1' },
  { label: '修改', value: '2' },
  { label: '删除', value: '3' },
  { label: '授权', value: '4' },
  { label: '导出', value: '5' },
  { label: '导入', value: '6' },
  { label: '强退', value: '7' },
  { label: '生成代码', value: '8' },
  { label: '清空数据', value: '9' },
] as const

export function getOperlogBusinessTypeLabel(value?: OperlogBusinessType) {
  return operlogBusinessTypeOptions.find((item) => item.value === value)?.label ?? '其它'
}

export function buildListOperlogParams(search: OperlogSearch) {
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    title: search.title?.trim() || undefined,
    operName: search.operName?.trim() || undefined,
    businessType: mapBusinessTypeToBackend(search.businessType),
    status: mapStatusToBackend(search.status),
  }
}

export function buildExportOperlogPayload(search: OperlogSearch) {
  return {
    title: search.title?.trim() || undefined,
    operName: search.operName?.trim() || undefined,
    businessType: mapBusinessTypeToBackend(search.businessType),
    status: mapStatusToBackend(search.status),
  }
}

export function mapBackendOperlogItem(item: BackendOperlogItem) {
  return {
    id: String(item.operId),
    operId: item.operId,
    title: item.title ?? '',
    businessType: item.businessType ?? '0',
    operName: item.operName ?? '',
    operIp: item.operIp ?? '',
    operLocation: item.operLocation ?? '',
    requestMethod: item.requestMethod ?? '',
    operUrl: item.operUrl ?? '',
    method: item.method ?? '',
    operParam: item.operParam ?? '',
    jsonResult: item.jsonResult ?? '',
    status: item.status === '1' ? 'error' : 'success',
    errorMsg: item.errorMsg ?? '',
    costTime: item.costTime ?? 0,
    operTime: normalizeDate(item.operTime),
  } as const
}
