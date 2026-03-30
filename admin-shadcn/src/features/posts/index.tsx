import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { fetchPosts } from './api/posts'
import { PostsDialogs } from './components/posts-dialogs'
import { PostsPrimaryButtons } from './components/posts-primary-buttons'
import { PostsProvider } from './components/posts-provider'
import { PostsTable } from './components/posts-table'

const route = getRouteApi('/_authenticated/system/post/')

export function Posts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const postsQuery = useQuery({
    queryKey: ['posts', search],
    queryFn: () => fetchPosts(search),
    placeholderData: (previousData) => previousData,
  })

  const postsData = postsQuery.data ?? { list: [], total: 0 }

  return (
    <PostsProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>岗位管理</h2>
          </div>
          <PostsPrimaryButtons search={search} />
        </div>
        <PostsTable
          data={postsData.list}
          total={postsData.total}
          isLoading={postsQuery.isLoading}
          search={search}
          navigate={navigate}
        />
      </Main>

      <PostsDialogs />
    </PostsProvider>
  )
}
