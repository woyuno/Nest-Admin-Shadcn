export type DeptsSearch = {
  deptName?: string
  status?: Array<'active' | 'inactive'>
}

export type BackendDeptListItem = {
  deptId: number
  parentId: number
  deptName: string
  orderNum: number
  leader?: string
  phone?: string
  email?: string
  status: '0' | '1'
  createTime?: string | Date
}

export type BackendDeptDetail = {
  deptId?: number
  parentId?: number
  deptName?: string
  orderNum?: number
  leader?: string
  phone?: string
  email?: string
  status?: '0' | '1'
}

export type DeptTreeNode = ReturnType<typeof mapBackendDeptItem> & {
  children?: DeptTreeNode[]
}

export type DeptFormValues = {
  deptId?: number
  parentId: string
  deptName: string
  orderNum: number
  leader: string
  phone: string
  email: string
  status: 'active' | 'inactive'
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

function mapBackendDeptItem(item: BackendDeptListItem) {
  return {
    id: String(item.deptId),
    deptId: item.deptId,
    parentId: item.parentId,
    deptName: item.deptName,
    orderNum: item.orderNum,
    leader: item.leader ?? '',
    phone: item.phone ?? '',
    email: item.email ?? '',
    status: item.status === '0' ? 'active' : 'inactive',
    createdAt: normalizeDate(item.createTime),
  } as const
}

export function buildListDeptsParams(search: DeptsSearch) {
  return {
    deptName: search.deptName?.trim() || undefined,
    status: mapStatusToBackend(search.status),
  }
}

export function buildDeptTree(items: BackendDeptListItem[]) {
  const mapped = items.map((item) => ({
    ...mapBackendDeptItem(item),
    children: [] as DeptTreeNode[],
  }))
  const byId = new Map(mapped.map((item) => [item.deptId, item]))
  const roots: DeptTreeNode[] = []

  for (const item of mapped) {
    const parent = byId.get(item.parentId)
    if (parent && item.deptId !== item.parentId) {
      parent.children?.push(item)
    } else {
      roots.push(item)
    }
  }

  const sortChildren = (nodes: DeptTreeNode[]) => {
    nodes.sort((a, b) => a.orderNum - b.orderNum || a.deptId - b.deptId)
    nodes.forEach((node) => sortChildren(node.children ?? []))
  }

  sortChildren(roots)
  return roots
}

export function flattenVisibleDeptRows(
  nodes: DeptTreeNode[],
  expandedIds: Set<number>,
  depth = 0
): Array<DeptTreeNode & { depth: number; hasChildren: boolean }> {
  return nodes.flatMap((node) => {
    const children = node.children ?? []
    const current = {
      ...node,
      depth,
      hasChildren: children.length > 0,
    }

    if (!expandedIds.has(node.deptId)) {
      return [current]
    }

    return [current, ...flattenVisibleDeptRows(children, expandedIds, depth + 1)]
  })
}

export function flattenDeptOptions(
  nodes: DeptTreeNode[],
  labels: string[] = []
): Array<{ label: string; value: string }> {
  return nodes.flatMap((node) => {
    const nextLabels = [...labels, node.deptName]
    const current = {
      label: nextLabels.join(' / '),
      value: String(node.deptId),
    }

    return [current, ...flattenDeptOptions(node.children ?? [], nextLabels)]
  })
}

export function buildDeptFormDefaults(detail: BackendDeptDetail): DeptFormValues {
  return {
    deptId: detail.deptId,
    parentId: String(detail.parentId ?? 0),
    deptName: detail.deptName ?? '',
    orderNum: detail.orderNum ?? 0,
    leader: detail.leader ?? '',
    phone: detail.phone ?? '',
    email: detail.email ?? '',
    status: detail.status === '1' ? 'inactive' : 'active',
  }
}

export function buildDeptSavePayload(values: DeptFormValues) {
  return {
    deptId: values.deptId,
    parentId: Number(values.parentId || 0),
    deptName: values.deptName.trim(),
    orderNum: Number(values.orderNum),
    leader: values.leader.trim() || undefined,
    phone: values.phone.trim() || undefined,
    email: values.email.trim() || undefined,
    status: values.status === 'active' ? '0' : '1',
  }
}
