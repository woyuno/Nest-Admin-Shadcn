export type DictTypeSearch = {
  page?: number
  pageSize?: number
  dictName?: string
  dictType?: string
  status?: Array<'active' | 'inactive'>
}

export type DictDataSearch = {
  page?: number
  pageSize?: number
  dictType?: string
  dictLabel?: string
  status?: Array<'active' | 'inactive'>
}

export type BackendDictTypeItem = {
  dictId: number
  dictName: string
  dictType: string
  status?: '0' | '1'
  remark?: string
  createTime?: string | Date
}

export type BackendDictDataItem = {
  dictCode: number
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass?: string
  listClass?: string
  status?: '0' | '1'
  remark?: string
  createTime?: string | Date
}

export type BackendDictTypeDetail = {
  dictId?: number
  dictName?: string
  dictType?: string
  status?: '0' | '1'
  remark?: string
}

export type BackendDictDataDetail = {
  dictCode?: number
  dictSort?: number
  dictLabel?: string
  dictValue?: string
  dictType?: string
  cssClass?: string
  listClass?: string
  status?: '0' | '1'
  remark?: string
}

export type DictTypeFormValues = {
  dictId?: number
  dictName: string
  dictType: string
  status: 'active' | 'inactive'
  remark: string
}

export type DictDataFormValues = {
  dictCode?: number
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass: string
  listClass: string
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

export function buildDictTypeSearchParams(search: DictTypeSearch) {
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    dictName: search.dictName?.trim() || undefined,
    dictType: search.dictType?.trim() || undefined,
    status: mapStatusToBackend(search.status),
  }
}

export function buildDictDataSearchParams(search: DictDataSearch) {
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    dictType: search.dictType?.trim() || undefined,
    dictLabel: search.dictLabel?.trim() || undefined,
    status: mapStatusToBackend(search.status),
  }
}

export function mapBackendDictTypeItem(item: BackendDictTypeItem) {
  return {
    id: String(item.dictId),
    dictId: item.dictId,
    dictName: item.dictName,
    dictType: item.dictType,
    status: item.status === '1' ? 'inactive' : 'active',
    remark: item.remark ?? '',
    createdAt: normalizeDate(item.createTime),
  } as const
}

export function mapBackendDictDataItem(item: BackendDictDataItem) {
  return {
    id: String(item.dictCode),
    dictCode: item.dictCode,
    dictSort: item.dictSort,
    dictLabel: item.dictLabel,
    dictValue: item.dictValue,
    dictType: item.dictType,
    cssClass: item.cssClass ?? '',
    listClass: item.listClass?.trim() || 'default',
    status: item.status === '1' ? 'inactive' : 'active',
    remark: item.remark ?? '',
    createdAt: normalizeDate(item.createTime),
  } as const
}

export function buildDictTypeFormDefaults(detail: BackendDictTypeDetail): DictTypeFormValues {
  return {
    dictId: detail.dictId,
    dictName: detail.dictName ?? '',
    dictType: detail.dictType ?? '',
    status: detail.status === '1' ? 'inactive' : 'active',
    remark: detail.remark ?? '',
  }
}

export function buildDictDataFormDefaults(detail: BackendDictDataDetail): DictDataFormValues {
  return {
    dictCode: detail.dictCode,
    dictSort: detail.dictSort ?? 0,
    dictLabel: detail.dictLabel ?? '',
    dictValue: detail.dictValue ?? '',
    dictType: detail.dictType ?? '',
    cssClass: detail.cssClass ?? '',
    listClass: detail.listClass?.trim() || 'default',
    status: detail.status === '1' ? 'inactive' : 'active',
    remark: detail.remark ?? '',
  }
}

export function buildDictTypeSavePayload(values: DictTypeFormValues) {
  return {
    dictId: values.dictId,
    dictName: values.dictName.trim(),
    dictType: values.dictType.trim(),
    status: values.status === 'active' ? '0' : '1',
    remark: values.remark.trim() || undefined,
  }
}

export function buildDictDataSavePayload(values: DictDataFormValues) {
  return {
    dictCode: values.dictCode,
    dictSort: Number(values.dictSort),
    dictLabel: values.dictLabel.trim(),
    dictValue: values.dictValue.trim(),
    dictType: values.dictType.trim(),
    cssClass: values.cssClass.trim() || undefined,
    listClass: values.listClass.trim() || 'default',
    status: values.status === 'active' ? '0' : '1',
    remark: values.remark.trim() || undefined,
  }
}
