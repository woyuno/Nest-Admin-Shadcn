export type RolesSearch = {
  page?: number
  pageSize?: number
  roleName?: string
  roleKey?: string
  status?: Array<'active' | 'inactive'>
  beginTime?: string
  endTime?: string
}

export type RolesToolbarDraft = {
  roleName: string
  roleKey: string
  status: 'all' | 'active' | 'inactive'
  beginTime: string
  endTime: string
}

export function buildRolesToolbarDraft(search: RolesSearch): RolesToolbarDraft {
  return {
    roleName: search.roleName ?? '',
    roleKey: search.roleKey ?? '',
    status: search.status?.[0] ?? 'all',
    beginTime: search.beginTime ?? '',
    endTime: search.endTime ?? '',
  }
}

export function resetRolesToolbarDraft(
  draft: RolesToolbarDraft
): RolesToolbarDraft {
  return {
    ...draft,
    roleName: '',
    roleKey: '',
    status: 'all',
    beginTime: '',
    endTime: '',
  }
}

export function buildRolesToolbarSearch(
  prev: RolesSearch,
  draft: RolesToolbarDraft
): RolesSearch {
  const hasCompleteDateRange = Boolean(draft.beginTime && draft.endTime)

  return {
    ...prev,
    page: 1,
    roleName: draft.roleName.trim() || undefined,
    roleKey: draft.roleKey.trim() || undefined,
    status: draft.status === 'all' ? undefined : [draft.status],
    beginTime: hasCompleteDateRange ? draft.beginTime : undefined,
    endTime: hasCompleteDateRange ? draft.endTime : undefined,
  }
}

export function resetRolesToolbarSearch(prev: RolesSearch): RolesSearch {
  return {
    ...prev,
    page: 1,
    roleName: undefined,
    roleKey: undefined,
    status: undefined,
    beginTime: undefined,
    endTime: undefined,
  }
}
