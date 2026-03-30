import { request } from '@/lib/request'
import {
  mapBackendServerOverview,
  type BackendServerOverview,
} from '../lib/server-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

export async function fetchServerOverview() {
  const response = await request.get<ApiEnvelope<BackendServerOverview>>(
    '/monitor/server'
  )

  return mapBackendServerOverview(response.data.data || {})
}
