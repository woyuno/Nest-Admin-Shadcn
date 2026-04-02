import { fetchCurrentRouters, fetchCurrentUserInfo } from '../api/auth'
import { buildSidebarGroupsFromMenus } from './authorization-contract'
import { frontendPageRegistry } from './page-registry'
import { useAuthStore } from '@/stores/auth-store'

export async function ensureCurrentUser() {
  const state = useAuthStore.getState().auth

  if (!state.accessToken) {
    return null
  }

  if (state.user) {
    return state.user
  }

  const profile = await fetchCurrentUserInfo()
  state.setUser(profile)
  return profile
}

export async function ensureAuthorizationContext() {
  const state = useAuthStore.getState().auth

  if (!state.accessToken) {
    return null
  }

  if (state.menuTree.length > 0) {
    return {
      menuTree: state.menuTree,
      sidebarGroups: state.sidebarGroups,
      allowedRoutePaths: state.allowedRoutePaths,
      menuWarnings: state.menuWarnings,
    }
  }

  const menuTree = await fetchCurrentRouters()
  const sidebar = buildSidebarGroupsFromMenus(menuTree, frontendPageRegistry)

  if (sidebar.warnings.length > 0) {
    sidebar.warnings.forEach((warning) => console.warn(warning))
  }

  state.setMenuContext({
    menuTree,
    sidebarGroups: sidebar.navGroups,
    allowedRoutePaths: sidebar.allowedRoutePaths,
    menuWarnings: sidebar.warnings,
  })

  return {
    menuTree,
    sidebarGroups: sidebar.navGroups,
    allowedRoutePaths: sidebar.allowedRoutePaths,
    menuWarnings: sidebar.warnings,
  }
}
