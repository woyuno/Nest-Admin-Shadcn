import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'
import { RolesDeleteDialog } from '@/views/roles/components/roles-delete-dialog'
import { RolesMultiDeleteDialog } from '@/views/roles/components/roles-multi-delete-dialog'

vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/components/confirm-dialog', () => ({
  ConfirmDialog: ({
    title,
    desc,
    disabled,
    confirmText,
  }: {
    title: React.ReactNode
    desc: React.ReactNode
    disabled?: boolean
    confirmText?: React.ReactNode
  }) => (
    <section data-disabled={disabled ? 'true' : 'false'}>
      <div>{title}</div>
      <div>{desc}</div>
      <button>{confirmText}</button>
    </section>
  ),
}))

describe('delete dialogs', () => {
  it('uses direct confirmation for user deletion dialogs', () => {
    const singleHtml = renderToStaticMarkup(
      <UsersDeleteDialog
        open
        onOpenChange={vi.fn()}
        currentRow={{
          userId: 1,
          username: 'zhangsan',
          userName: '张三',
        } as never}
      />
    )

    const multiHtml = renderToStaticMarkup(
      <UsersMultiDeleteDialog
        open
        onOpenChange={vi.fn()}
        selectedUsers={[
          {
            userId: 1,
            username: 'zhangsan',
            userName: '张三',
          } as never,
        ]}
      />
    )

    expect(singleHtml).toContain('确认删除用户')
    expect(singleHtml).not.toContain('请输入用户名以确认删除')
    expect(singleHtml).not.toContain('风险提示')
    expect(singleHtml).toContain('data-disabled="false"')

    expect(multiHtml).toContain('确认删除当前选中的用户吗')
    expect(multiHtml).not.toContain('DELETE')
    expect(multiHtml).not.toContain('风险提示')
    expect(multiHtml).toContain('data-disabled="false"')
  })

  it('uses direct confirmation for role deletion dialogs', () => {
    const singleHtml = renderToStaticMarkup(
      <RolesDeleteDialog
        open
        onOpenChange={vi.fn()}
        currentRow={{
          roleId: 2,
          roleName: '测试角色',
        } as never}
      />
    )

    const multiHtml = renderToStaticMarkup(
      <RolesMultiDeleteDialog
        open
        onOpenChange={vi.fn()}
        selectedRoles={[
          {
            roleId: 2,
            roleName: '测试角色',
          } as never,
        ]}
      />
    )

    expect(singleHtml).toContain('确认删除角色')
    expect(singleHtml).not.toContain('请输入角色名称以确认删除')
    expect(singleHtml).not.toContain('风险提示')
    expect(singleHtml).toContain('data-disabled="false"')

    expect(multiHtml).toContain('确认删除当前选中的角色吗')
    expect(multiHtml).not.toContain('DELETE')
    expect(multiHtml).not.toContain('风险提示')
    expect(multiHtml).toContain('data-disabled="false"')
  })
})

