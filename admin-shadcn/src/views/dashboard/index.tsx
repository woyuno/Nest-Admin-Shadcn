import { Link } from '@tanstack/react-router'
import {
  Blocks,
  BriefcaseBusiness,
  MonitorCog,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const quickLinks = [
  {
    title: '用户管理',
    desc: '维护用户、角色和归属部门',
    to: '/system/user',
    icon: Users,
  },
  {
    title: '角色管理',
    desc: '配置角色权限和菜单范围',
    to: '/system/role',
    icon: ShieldCheck,
  },
  {
    title: '定时任务',
    desc: '查看任务调度、执行记录和状态',
    to: '/monitor/job',
    icon: MonitorCog,
  },
  {
    title: '参数设置',
    desc: '管理系统参数和缓存刷新',
    to: '/system/config',
    icon: Blocks,
  },
] as const

export function Dashboard() {
  const user = useAuthStore((state) => state.auth.user)
  const sidebarGroups = useAuthStore((state) => state.auth.sidebarGroups)
  const menuWarnings = useAuthStore((state) => state.auth.menuWarnings)

  const displayName = user?.displayName || user?.userName || '管理员'
  const roles = user?.roles ?? []
  const permissions = user?.permissions ?? []
  const allowedEntries = sidebarGroups.reduce((total, group) => total + group.items.length, 0)

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              欢迎回来，{displayName}
            </h1>
          </div>
          <Button asChild>
            <Link to='/settings'>查看个人中心</Link>
          </Button>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>当前账号</CardDescription>
              <CardTitle className='text-2xl'>{user?.userName || '未登录'}</CardTitle>
            </CardHeader>
            <CardContent className='text-sm text-muted-foreground'>
              显示名称：{displayName}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>所属部门</CardDescription>
              <CardTitle className='text-2xl'>{user?.deptName || '未分配'}</CardTitle>
            </CardHeader>
            <CardContent className='text-sm text-muted-foreground'>
              已识别角色 {roles.length} 个
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>菜单导航</CardDescription>
              <CardTitle className='text-2xl'>{allowedEntries}</CardTitle>
            </CardHeader>
            <CardContent className='text-sm text-muted-foreground'>
              当前分组 {sidebarGroups.length} 个，未映射菜单 {menuWarnings.length} 项
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>权限点</CardDescription>
              <CardTitle className='text-2xl'>{permissions.length}</CardTitle>
            </CardHeader>
            <CardContent className='text-sm text-muted-foreground'>
              最高角色：{roles[0] || '未识别'}
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]'>
          <Card>
            <CardHeader>
              <CardTitle>高频入口</CardTitle>
              <CardDescription>从首页直接进入系统管理、监控和参数维护流程。</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-3 md:grid-cols-2'>
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className='rounded-lg border p-4 transition-colors hover:border-primary hover:bg-muted/40'
                >
                  <div className='mb-3 flex items-center gap-2'>
                    <link.icon className='size-5 text-primary' />
                    <div className='font-medium'>{link.title}</div>
                  </div>
                  <div className='text-sm text-muted-foreground'>{link.desc}</div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>当前会话摘要</CardTitle>
              <CardDescription>用于快速确认当前登录身份和迁移状态。</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 text-sm'>
              <div className='rounded-md border p-3'>
                <div className='text-muted-foreground'>显示名称</div>
                <div className='font-medium'>{displayName}</div>
              </div>
              <div className='rounded-md border p-3'>
                <div className='text-muted-foreground'>角色列表</div>
                <div className='font-medium'>{roles.join(' / ') || '未识别角色'}</div>
              </div>
              <div className='rounded-md border p-3'>
                <div className='text-muted-foreground'>并行迁移状态</div>
                <div className='font-medium'>
                  {menuWarnings.length === 0 ? '动态菜单已全部映射' : `仍有 ${menuWarnings.length} 项待映射`}
                </div>
              </div>
              <Button asChild variant='outline' className='w-full'>
                <Link to='/monitor/online'>
                  <BriefcaseBusiness className='me-2 size-4' />
                  前往系统监控
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
