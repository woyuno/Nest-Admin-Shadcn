export type MenusSearch = {
  menuName?: string
  status?: Array<'active' | 'inactive'>
}

export type BackendMenuListItem = {
  menuId: number
  parentId: number
  menuName: string
  orderNum: number
  path?: string
  component?: string
  query?: string
  isFrame: '0' | '1'
  isCache: '0' | '1'
  visible: '0' | '1'
  status: '0' | '1'
  menuType: 'M' | 'C' | 'F'
  perms?: string
  icon?: string
  createTime?: string | Date
}

export type BackendMenuDetail = {
  menuId?: number
  parentId?: number
  menuName?: string
  orderNum?: number
  path?: string
  component?: string
  query?: string
  isFrame?: '0' | '1'
  isCache?: '0' | '1'
  visible?: '0' | '1'
  status?: '0' | '1'
  menuType?: 'M' | 'C' | 'F'
  perms?: string
  icon?: string
}

export type MenuFormValues = {
  menuId?: number
  parentId: string
  menuName: string
  orderNum: number
  path: string
  component: string
  query: string
  isFrame: 'yes' | 'no'
  isCache: 'cache' | 'noCache'
  visible: 'show' | 'hide'
  status: 'active' | 'inactive'
  menuType: 'directory' | 'menu' | 'button'
  perms: string
  icon: string
}

export type MenuTreeNode = ReturnType<typeof mapBackendMenuItem> & {
  children?: MenuTreeNode[]
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

function mapBackendMenuItem(item: BackendMenuListItem) {
  return {
    id: String(item.menuId),
    menuId: item.menuId,
    parentId: item.parentId,
    menuName: item.menuName,
    orderNum: item.orderNum,
    path: item.path ?? '',
    component: item.component ?? '',
    query: item.query ?? '',
    isFrame: item.isFrame === '0' ? 'yes' : 'no',
    isCache: item.isCache === '0' ? 'cache' : 'noCache',
    visible: item.visible === '0' ? 'show' : 'hide',
    status: item.status === '0' ? 'active' : 'inactive',
    menuType:
      item.menuType === 'M'
        ? 'directory'
        : item.menuType === 'C'
          ? 'menu'
          : 'button',
    perms: item.perms ?? '',
    icon: item.icon ?? '',
    createdAt: normalizeDate(item.createTime),
  } as const
}

export function buildListMenusParams(search: MenusSearch) {
  return {
    menuName: search.menuName?.trim() || undefined,
    status: mapStatusToBackend(search.status),
  }
}

export function buildMenuTree(items: BackendMenuListItem[]) {
  const mapped = items.map((item) => ({
    ...mapBackendMenuItem(item),
    children: [] as MenuTreeNode[],
  }))
  const byId = new Map(mapped.map((item) => [item.menuId, item]))
  const roots: MenuTreeNode[] = []

  for (const item of mapped) {
    const parent = byId.get(item.parentId)
    if (parent && item.menuId !== item.parentId) {
      parent.children?.push(item)
    } else {
      roots.push(item)
    }
  }

  const sortChildren = (nodes: MenuTreeNode[]) => {
    nodes.sort((a, b) => a.orderNum - b.orderNum || a.menuId - b.menuId)
    nodes.forEach((node) => sortChildren(node.children ?? []))
  }

  sortChildren(roots)
  return roots
}

export function flattenVisibleMenuRows(
  nodes: MenuTreeNode[],
  expandedIds: Set<number>,
  depth = 0
): Array<MenuTreeNode & { depth: number; hasChildren: boolean }> {
  return nodes.flatMap((node) => {
    const children = node.children ?? []
    const current = {
      ...node,
      depth,
      hasChildren: children.length > 0,
    }

    if (!expandedIds.has(node.menuId)) {
      return [current]
    }

    return [current, ...flattenVisibleMenuRows(children, expandedIds, depth + 1)]
  })
}

export function flattenMenuOptions(
  nodes: MenuTreeNode[],
  labels: string[] = []
): Array<{ label: string; value: string }> {
  return nodes.flatMap((node) => {
    const nextLabels = [...labels, node.menuName]
    const current = {
      label: nextLabels.join(' / '),
      value: String(node.menuId),
    }

    return [current, ...flattenMenuOptions(node.children ?? [], nextLabels)]
  })
}

export function buildMenuFormDefaults(detail: BackendMenuDetail): MenuFormValues {
  return {
    menuId: detail.menuId,
    parentId: String(detail.parentId ?? 0),
    menuName: detail.menuName ?? '',
    orderNum: detail.orderNum ?? 0,
    path: detail.path ?? '',
    component: detail.component ?? '',
    query: detail.query ?? '',
    isFrame: detail.isFrame === '0' ? 'yes' : 'no',
    isCache: detail.isCache === '1' ? 'noCache' : 'cache',
    visible: detail.visible === '1' ? 'hide' : 'show',
    status: detail.status === '1' ? 'inactive' : 'active',
    menuType:
      detail.menuType === 'M'
        ? 'directory'
        : detail.menuType === 'C'
          ? 'menu'
          : 'button',
    perms: detail.perms ?? '',
    icon: detail.icon ?? '',
  }
}

export function buildMenuSavePayload(values: MenuFormValues) {
  return {
    menuId: values.menuId,
    parentId: Number(values.parentId || 0),
    menuName: values.menuName.trim(),
    orderNum: Number(values.orderNum),
    path: values.path.trim() || undefined,
    component: values.component.trim() || undefined,
    query: values.query.trim() || undefined,
    isFrame: values.isFrame === 'yes' ? '0' : '1',
    isCache: values.isCache === 'cache' ? '0' : '1',
    visible: values.visible === 'show' ? '0' : '1',
    status: values.status === 'active' ? '0' : '1',
    menuType:
      values.menuType === 'directory'
        ? 'M'
        : values.menuType === 'menu'
          ? 'C'
          : 'F',
    perms: values.perms.trim() || undefined,
    icon: values.icon.trim() || undefined,
  }
}
