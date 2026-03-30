import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { type NavGroup } from '@/components/layout/types'
import { type BackendMenuRoute } from '@/features/auth/lib/authorization-contract'

const ACCESS_TOKEN = 'Admin-Token'

interface AuthUser {
  id: number
  userName: string
  displayName: string
  deptId: number
  deptName: string
  roles: string[]
  permissions: string[]
  profile: Record<string, unknown>
}

interface AuthState {
  auth: {
    user: AuthUser | null
    menuTree: BackendMenuRoute[]
    sidebarGroups: NavGroup[]
    allowedRoutePaths: string[]
    menuWarnings: string[]
    setUser: (user: AuthUser | null) => void
    setMenuContext: (input: {
      menuTree: BackendMenuRoute[]
      sidebarGroups: NavGroup[]
      allowedRoutePaths: string[]
      menuWarnings: string[]
    }) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const initToken = getCookie(ACCESS_TOKEN) || ''
  return {
    auth: {
      user: null,
      menuTree: [],
      sidebarGroups: [],
      allowedRoutePaths: [],
      menuWarnings: [],
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      setMenuContext: ({ menuTree, sidebarGroups, allowedRoutePaths, menuWarnings }) =>
        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            menuTree,
            sidebarGroups,
            allowedRoutePaths,
            menuWarnings,
          },
        })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, accessToken)
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              menuTree: [],
              sidebarGroups: [],
              allowedRoutePaths: [],
              menuWarnings: [],
            },
          }
        }),
    },
  }
})
