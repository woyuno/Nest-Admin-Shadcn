export type ExampleSearch = {
  page?: number
  pageSize?: number
  exampleName?: string
  status?: Array<'enabled' | 'disabled'>
  beginTime?: string
  endTime?: string
}

export type ExampleToolbarDraft = {
  exampleName: string
  status: 'all' | 'enabled' | 'disabled'
  beginTime: string
  endTime: string
}

export function buildExampleToolbarDraft(
  search: ExampleSearch
): ExampleToolbarDraft {
  return {
    exampleName: search.exampleName ?? '',
    status: search.status?.[0] ?? 'all',
    beginTime: search.beginTime ?? '',
    endTime: search.endTime ?? '',
  }
}

export function resetExampleToolbarDraft(
  draft: ExampleToolbarDraft
): ExampleToolbarDraft {
  return {
    ...draft,
    exampleName: '',
    status: 'all',
    beginTime: '',
    endTime: '',
  }
}

export function buildExampleToolbarSearch(
  prev: ExampleSearch,
  draft: ExampleToolbarDraft
): ExampleSearch {
  const hasCompleteDateRange = Boolean(draft.beginTime && draft.endTime)

  return {
    ...prev,
    page: 1,
    exampleName: draft.exampleName.trim() || undefined,
    status: draft.status === 'all' ? undefined : [draft.status],
    beginTime: hasCompleteDateRange ? draft.beginTime : undefined,
    endTime: hasCompleteDateRange ? draft.endTime : undefined,
  }
}

export function resetExampleToolbarSearch(prev: ExampleSearch): ExampleSearch {
  return {
    ...prev,
    page: 1,
    exampleName: undefined,
    status: undefined,
    beginTime: undefined,
    endTime: undefined,
  }
}
