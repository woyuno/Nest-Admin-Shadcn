import { request } from '@/lib/request'
import {
  buildExportPostsPayload,
  buildListPostsParams,
  buildPostFormDefaults,
  buildPostSavePayload,
  mapBackendPostListItem,
  type BackendPostDetail,
  type BackendPostListItem,
  type PostFormValues,
  type PostsSearch,
} from '../lib/post-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendPostsListResponse = {
  list: BackendPostListItem[]
  total: number
}

export const postsQueryKey = ['posts'] as const

export async function fetchPosts(search: PostsSearch) {
  const response = await request.get<ApiEnvelope<BackendPostsListResponse>>(
    '/system/post/list',
    { params: buildListPostsParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendPostListItem),
    total: response.data.data.total || 0,
  }
}

export async function fetchPostDetail(postId: number) {
  const response = await request.get<ApiEnvelope<BackendPostDetail>>(
    `/system/post/${postId}`
  )

  return buildPostFormDefaults(response.data.data || {})
}

export async function createPost(values: PostFormValues) {
  await request.post<ApiEnvelope<unknown>>(
    '/system/post',
    buildPostSavePayload(values)
  )
}

export async function updatePost(values: PostFormValues) {
  await request.put<ApiEnvelope<unknown>>(
    '/system/post',
    buildPostSavePayload(values)
  )
}

export async function deletePost(postId: number | string) {
  await request.delete<ApiEnvelope<unknown>>(`/system/post/${postId}`)
}

export async function deletePosts(postIds: Array<number | string>) {
  await request.delete<ApiEnvelope<unknown>>(`/system/post/${postIds.join(',')}`)
}

export async function exportPosts(search: PostsSearch) {
  const response = await request.get<Blob>('/system/post/export', {
    params: buildExportPostsPayload(search),
    responseType: 'blob',
  })

  return response.data
}
