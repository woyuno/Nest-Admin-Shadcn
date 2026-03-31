export type UsersSearch = {
  page?: number
  pageSize?: number
  deptId?: string
  username?: string
  phonenumber?: string
  status?: Array<'active' | 'inactive'>
  beginTime?: string
  endTime?: string
}

export type UsersToolbarDraft = {
  username: string
  phonenumber: string
  status: 'all' | 'active' | 'inactive'
  beginTime: string
  endTime: string
}

export function buildUsersToolbarDraft(search: UsersSearch): UsersToolbarDraft {
  return {
    username: search.username ?? '',
    phonenumber: search.phonenumber ?? '',
    status: search.status?.[0] ?? 'all',
    beginTime: search.beginTime ?? '',
    endTime: search.endTime ?? '',
  }
}

export function resetUsersToolbarDraft(
  draft: UsersToolbarDraft
): UsersToolbarDraft {
  return {
    ...draft,
    username: '',
    phonenumber: '',
    status: 'all',
    beginTime: '',
    endTime: '',
  }
}

export function buildUsersToolbarSearch(
  prev: UsersSearch,
  draft: UsersToolbarDraft
): UsersSearch {
  const hasCompleteDateRange = Boolean(draft.beginTime && draft.endTime)

  return {
    ...prev,
    page: 1,
    username: draft.username.trim() || undefined,
    phonenumber: draft.phonenumber.trim() || undefined,
    status: draft.status === 'all' ? undefined : [draft.status],
    beginTime: hasCompleteDateRange ? draft.beginTime : undefined,
    endTime: hasCompleteDateRange ? draft.endTime : undefined,
  }
}

export function resetUsersToolbarSearch(prev: UsersSearch): UsersSearch {
  return {
    ...prev,
    page: 1,
    username: undefined,
    phonenumber: undefined,
    status: undefined,
    beginTime: undefined,
    endTime: undefined,
  }
}
