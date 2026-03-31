/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react'
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { SignedIn, useAuth, UserButton } from '@clerk/clerk-react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LearnMore } from '@/components/learn-more'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from '@/views/users/components/users-dialogs'
import { UsersPrimaryButtons } from '@/views/users/components/users-primary-buttons'
import { UsersProvider } from '@/views/users/components/users-provider'
import { UsersTable } from '@/views/users/components/users-table'
import { users } from '@/views/users/data/users'

export const Route = createFileRoute('/clerk/_authenticated/user-management')({
  component: UserManagement,
})

function UserManagement() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const [opened, setOpened] = useState(true)
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className='flex h-svh items-center justify-center'>
        <Loader2 className='size-8 animate-spin' />
      </div>
    )
  }

  if (!isSignedIn) {
    return <Unauthorized />
  }

  return (
    <>
      <SignedIn>
        <UsersProvider>
          <Header fixed>
            <Search />
            <div className='ms-auto flex items-center space-x-4'>
              <ThemeSwitch />
              <UserButton />
            </div>
          </Header>

          <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
              <div>
                <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
                <div className='flex gap-1'>
                  <p className='text-muted-foreground'>
                    Manage your users and their roles here.
                  </p>
                  <LearnMore
                    open={opened}
                    onOpenChange={setOpened}
                    contentProps={{ side: 'right' }}
                  >
                    <p>
                      This is the same as{' '}
                      <Link
                        to='/system/user'
                        className='text-blue-500 underline decoration-dashed underline-offset-2'
                      >
                        '/system/user'
                      </Link>
                    </p>

                    <p className='mt-4'>
                      You can sign out or manage/delete your account via the
                      User Profile menu in the top-right corner of the page.
                      <ExternalLink className='inline-block size-4' />
                    </p>
                  </LearnMore>
                </div>
              </div>
              <UsersPrimaryButtons />
            </div>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              <UsersTable data={users} navigate={navigate} search={search} />
            </div>
          </Main>

          <UsersDialogs />
        </UsersProvider>
      </SignedIn>
    </>
  )
}

const COUNTDOWN = 5 // Countdown second

function Unauthorized() {
  const navigate = useNavigate()
  const { history } = useRouter()

  const [opened, setOpened] = useState(true)
  const [cancelled, setCancelled] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN)

  // Set and run the countdown conditionally
  useEffect(() => {
    if (cancelled || opened) return
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [cancelled, opened])

  // Navigate to sign-in page when countdown hits 0
  useEffect(() => {
    if (countdown > 0) return
    navigate({ to: '/clerk/sign-in' })
  }, [countdown, navigate])

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>401</h1>
        <span className='font-medium'>请先登录 Clerk 后再访问</span>
        <p className='text-center text-muted-foreground'>
          当前页面需要先通过 Clerk 完成登录认证{' '}
          <sup>
            <LearnMore open={opened} onOpenChange={setOpened}>
              <p>
                这和{' '}
                <Link
                  to='/system/user'
                  className='text-blue-500 underline decoration-dashed underline-offset-2'
                >
                  '/system/user'
                </Link>
                类似。{' '}
              </p>
              <p>必须先通过 Clerk 登录，才能访问当前路由。</p>

              <p className='mt-4'>
                登录后，你可以在当前页面右上角的用户菜单中退出登录或删除账号。
              </p>
            </LearnMore>
          </sup>
          <br />
          然后才能访问当前资源。
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            返回上一页
          </Button>
          <Button onClick={() => navigate({ to: '/clerk/sign-in' })}>
            <ClerkLogo className='invert' /> 去登录
          </Button>
        </div>
        <div className='mt-4 h-8 text-center'>
          {!cancelled && !opened && (
            <>
              <p>
                {countdown > 0
                  ? `${countdown} 秒后自动跳转到登录页`
                  : '正在跳转...'}
              </p>
              <Button variant='link' onClick={() => setCancelled(true)}>
                取消跳转
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

