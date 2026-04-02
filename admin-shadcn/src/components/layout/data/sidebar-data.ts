import { Command, GalleryVerticalEnd, LayoutDashboard, Settings } from 'lucide-react'
import { appConfig } from '@/config/app'
import { useAuthStore } from '@/stores/auth-store'
import { type SidebarData } from '../types'

const fallbackGroups: SidebarData['navGroups'] = [
  {
    title: '基础导航',
    items: [
      {
        title: '首页',
        url: '/',
        icon: LayoutDashboard,
      },
      {
        title: '设置',
        url: '/settings',
        icon: Settings,
      },
    ],
  },
]

export function useSidebarData(): SidebarData {
  const user = useAuthStore((state) => state.auth.user)
  const sidebarGroups = useAuthStore((state) => state.auth.sidebarGroups)
  const menuWarnings = useAuthStore((state) => state.auth.menuWarnings)

  const name = user?.displayName || user?.userName || '未登录'
  const email = user?.userName || '请先登录'

  return {
    user: {
      name,
      email,
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: appConfig.name,
        logo: Command,
        plan: '当前项目',
      },
      {
        name: '并行开发',
        logo: GalleryVerticalEnd,
        plan: '工作区',
      },
    ],
    navGroups: [
      ...(sidebarGroups.length > 0 ? sidebarGroups : fallbackGroups),
      ...(menuWarnings.length > 0
        ? [
            {
              title: '迁移提示',
              items: [
                {
                  title: `待映射菜单 ${menuWarnings.length} 项`,
                  url: '/settings',
                },
              ],
            },
          ]
        : []),
    ],
  }
}
