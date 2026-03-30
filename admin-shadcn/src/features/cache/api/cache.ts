import { request } from '@/lib/request'
import {
  buildCacheValueDefaults,
  mapBackendCacheKeys,
  mapBackendCacheNames,
  mapBackendCacheOverview,
  type BackendCacheName,
  type BackendCacheOverview,
  type BackendCacheValue,
} from '../lib/cache-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

export async function fetchCacheOverview() {
  const response = await request.get<ApiEnvelope<BackendCacheOverview>>(
    '/monitor/cache'
  )

  return mapBackendCacheOverview(response.data.data || {})
}

export async function fetchCacheNames() {
  const response = await request.get<ApiEnvelope<BackendCacheName[]>>(
    '/monitor/cache/getNames'
  )

  return mapBackendCacheNames(response.data.data || [])
}

export async function fetchCacheKeys(cacheName: string) {
  const response = await request.get<ApiEnvelope<string[]>>(
    `/monitor/cache/getKeys/${encodeURIComponent(cacheName)}`
  )

  return mapBackendCacheKeys(cacheName, response.data.data || [])
}

export async function fetchCacheValue(cacheName: string, cacheKey: string) {
  const response = await request.get<ApiEnvelope<BackendCacheValue>>(
    `/monitor/cache/getValue/${encodeURIComponent(cacheName)}/${encodeURIComponent(cacheKey)}`
  )

  return buildCacheValueDefaults(response.data.data || {})
}

export async function clearCacheName(cacheName: string) {
  await request.delete<ApiEnvelope<unknown>>(
    `/monitor/cache/clearCacheName/${encodeURIComponent(cacheName)}`
  )
}

export async function clearCacheKey(cacheKey: string) {
  await request.delete<ApiEnvelope<unknown>>(
    `/monitor/cache/clearCacheKey/${encodeURIComponent(cacheKey)}`
  )
}

export async function clearCacheAll() {
  await request.delete<ApiEnvelope<unknown>>('/monitor/cache/clearCacheAll')
}
