import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SignIn } from './index'

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => ({ redirect: undefined }),
  Link: ({ children, ...props }: React.ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock('./components/user-auth-form', () => ({
  UserAuthForm: () => <div data-testid='user-auth-form'>mocked-form</div>,
}))

vi.mock('../auth-layout', () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('SignIn', () => {
  it('keeps the login title but removes extra helper copy', () => {
    const html = renderToStaticMarkup(<SignIn />)

    expect(html).toContain('账号登录')
    expect(html).not.toContain('请输入用户名和密码')
    expect(html).not.toContain('如当前环境启用了验证码')
    expect(html).not.toContain('新前端正在并行迁移中')
  })
})
