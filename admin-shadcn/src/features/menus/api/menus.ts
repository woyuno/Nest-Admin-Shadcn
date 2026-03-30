import { request } from '@/lib/request'
import {
  buildListMenusParams,
  buildMenuFormDefaults,
  buildMenuSavePayload,
  buildMenuTree,
  type BackendMenuDetail,
  type BackendMenuListItem,
  type MenuFormValues,
  type MenusSearch,
} from '../lib/menu-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

export const menusQueryKey = ['menus'] as const

export async function fetchMenus(search: MenusSearch) {
  const response = await request.get<ApiEnvelope<BackendMenuListItem[]>>(
    '/system/menu/list',
    { params: buildListMenusParams(search) }
  )

  return buildMenuTree(response.data.data || [])
}

export async function fetchMenuTreeOptions() {
  const response = await request.get<ApiEnvelope<BackendMenuListItem[]>>(
    '/system/menu/list'
  )

  return buildMenuTree(response.data.data || [])
}

export async function fetchMenuDetail(menuId: number) {
  const response = await request.get<ApiEnvelope<BackendMenuDetail>>(
    `/system/menu/${menuId}`
  )

  return buildMenuFormDefaults(response.data.data || {})
}

export async function createMenu(values: MenuFormValues) {
  await request.post<ApiEnvelope<unknown>>(
    '/system/menu',
    buildMenuSavePayload(values)
  )
}

export async function updateMenu(values: MenuFormValues) {
  await request.put<ApiEnvelope<unknown>>(
    '/system/menu',
    buildMenuSavePayload(values)
  )
}

export async function deleteMenu(menuId: number | string) {
  await request.delete<ApiEnvelope<unknown>>(`/system/menu/${menuId}`)
}
