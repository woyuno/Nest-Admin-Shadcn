import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuRadioItem,
  DropdownMenuSubTrigger,
} from './dropdown-menu'

vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  Content: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Group: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Item: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CheckboxItem: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => <div className={className}>{children}</div>,
  ItemIndicator: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  RadioGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RadioItem: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Label: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Separator: ({ className }: { className?: string }) => <hr className={className} />,
  Sub: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SubTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  SubContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

describe('Dropdown menu interactions', () => {
  it('uses a pointer cursor for menu items and sub triggers', () => {
    const itemHtml = renderToStaticMarkup(<DropdownMenuItem>菜单项</DropdownMenuItem>)
    const checkboxHtml = renderToStaticMarkup(
      <DropdownMenuCheckboxItem checked>多选项</DropdownMenuCheckboxItem>
    )
    const radioHtml = renderToStaticMarkup(
      <DropdownMenuRadioItem value='a'>单选项</DropdownMenuRadioItem>
    )
    const subTriggerHtml = renderToStaticMarkup(
      <DropdownMenuSubTrigger>更多</DropdownMenuSubTrigger>
    )

    expect(itemHtml).toContain('cursor-pointer')
    expect(itemHtml).not.toContain('cursor-default')
    expect(checkboxHtml).toContain('cursor-pointer')
    expect(radioHtml).toContain('cursor-pointer')
    expect(subTriggerHtml).toContain('cursor-pointer')
  })
})
