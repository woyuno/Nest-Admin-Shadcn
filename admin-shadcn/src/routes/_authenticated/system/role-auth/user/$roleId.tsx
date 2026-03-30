import { ExternalLink, UsersRound } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
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

export const Route = createFileRoute(
  '/_authenticated/system/role-auth/user/$roleId'
)({
  component: RoleAuthUserPage,
})

function resolveLegacyToolUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

function RoleAuthUserPage() {
  const { roleId } = Route.useParams()
  const legacyRoleAuthUserUrl = resolveLegacyToolUrl(
    import.meta.env.VITE_ADMIN_VUE3_BASE_URL || 'http://127.0.0.1:8888',
    `/system/role-auth/user/${roleId}`
  )

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
        <Card>
          <CardHeader>
            <CardTitle>分配用户</CardTitle>
            <CardDescription>
              先通过兼容承载页恢复旧版的角色分配用户能力，保证业务可用。
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 text-sm text-muted-foreground'>
            <div className='flex flex-wrap gap-2'>
              <Button asChild variant='outline'>
                <a href={legacyRoleAuthUserUrl} target='_blank' rel='noreferrer'>
                  <ExternalLink className='me-2 size-4' />
                  新标签打开旧版分配用户页
                </a>
              </Button>
            </div>
            <div className='min-h-[78vh] overflow-hidden rounded-xl border bg-background'>
              <div className='flex items-center gap-2 border-b px-4 py-3 text-sm text-muted-foreground'>
                <UsersRound className='size-4' />
                兼容承载页面：{legacyRoleAuthUserUrl}
              </div>
              <iframe
                title='Legacy Role Auth User'
                src={legacyRoleAuthUserUrl}
                className='h-[78vh] w-full bg-background'
              />
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
