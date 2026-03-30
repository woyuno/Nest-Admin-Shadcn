export type GenTableSearch = {
  page?: number
  pageSize?: number
  tableName?: string
  tableComment?: string
}

export type BackendGenTableItem = {
  tableId: number
  tableName?: string
  tableComment?: string
  className?: string
  createTime?: string
  updateTime?: string
  genType?: string
  genPath?: string
}

function normalizeDate(value?: string) {
  if (!value) return new Date(0)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

export function buildListGenTablesParams(search: GenTableSearch) {
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    tableName: search.tableName?.trim() || undefined,
    tableComment: search.tableComment?.trim() || undefined,
  }
}

export function mapBackendGenTableItem(item: BackendGenTableItem) {
  return {
    id: String(item.tableId),
    tableId: item.tableId,
    tableName: item.tableName ?? '',
    tableComment: item.tableComment ?? '',
    className: item.className ?? '',
    createTime: normalizeDate(item.createTime),
    updateTime: normalizeDate(item.updateTime),
    genType: item.genType ?? '0',
    genPath: item.genPath ?? '',
  } as const
}
