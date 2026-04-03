import { request } from '@/lib/request'
import {
  buildListExamplesParams,
  mapBackendExampleListItem,
  type BackendExampleListItem,
  type ExampleSearch,
} from '../lib/example-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendExamplesListResponse = {
  list: BackendExampleListItem[]
  total: number
}

export async function fetchExamples(search: ExampleSearch) {
  const response = await request.get<ApiEnvelope<BackendExamplesListResponse>>(
    '/system/example/list',
    { params: buildListExamplesParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendExampleListItem),
    total: response.data.data.total || 0,
  }
}
