import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

type AdminPageShellProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  sidebar?: React.ReactNode
  children: React.ReactNode
  mainClassName?: string
  bodyClassName?: string
  contentClassName?: string
}

export function AdminPageShell({
  title,
  description,
  actions,
  sidebar,
  children,
  mainClassName,
  bodyClassName,
  contentClassName,
}: AdminPageShellProps) {
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

      <Main
        className={cn('flex flex-1 flex-col gap-4 sm:gap-6', mainClassName)}
      >
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
            {description ? (
              <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
            ) : null}
          </div>
          {actions}
        </div>

        {sidebar ? (
          <div
            className={cn(
              'flex flex-1 flex-col gap-4 lg:flex-row lg:items-start',
              bodyClassName
            )}
          >
            {sidebar}
            <div className={cn('flex flex-1 flex-col gap-4', contentClassName)}>
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </Main>
    </>
  )
}
