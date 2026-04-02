import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ProfileDropdown } from './profile-dropdown'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: React.ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock('@/hooks/use-dialog-state', () => ({
  default: () => [false, vi.fn()],
}))

vi.mock('@/views/settings/lib/settings-paths', () => ({
  getSettingsProfileEntryPath: () => '/settings/profile',
}))

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: { auth: { user: { displayName: string; userName: string } } }) => unknown) =>
    selector({
      auth: {
        user: {
          displayName: '巢管理员',
          userName: 'admin',
        },
      },
    }),
}))

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  AvatarImage: (props: React.ComponentProps<'img'>) => <img {...props} />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuShortcut: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/sign-out-dialog', () => ({
  SignOutDialog: () => null,
}))

describe('ProfileDropdown', () => {
  it('hides the team entry and static shortcut copy from the profile menu', () => {
    const html = renderToStaticMarkup(<ProfileDropdown />)

    expect(html).toContain('个人资料')
    expect(html).toContain('账户信息')
    expect(html).toContain('设置')
    expect(html).toContain('退出登录')
    expect(html).not.toContain('团队配置')
    expect(html).not.toContain('⇧⌘P')
    expect(html).not.toContain('⌘B')
    expect(html).not.toContain('⌘S')
    expect(html).not.toContain('⇧⌘Q')
  })
})

