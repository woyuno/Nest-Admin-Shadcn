import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SelectItem, SelectTrigger, SelectValue } from './select'

vi.mock('@radix-ui/react-select', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Group: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Value: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Trigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button className={className}>{children}</button>
  ),
  Icon: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Content: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Viewport: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Label: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Item: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  ItemIndicator: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  ItemText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Separator: ({ className }: { className?: string }) => <hr className={className} />,
  ScrollUpButton: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  ScrollDownButton: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

vi.mock('./overlay-container-context', () => ({
  useOverlayContainer: () => null,
}))

describe('SelectItem', () => {
  it('uses a pointer cursor for the trigger control', () => {
    const html = renderToStaticMarkup(
      <SelectTrigger>
        <SelectValue placeholder='全部状态' />
      </SelectTrigger>
    )

    expect(html).toContain('cursor-pointer')
  })

  it('uses a pointer cursor for selectable options', () => {
    const html = renderToStaticMarkup(<SelectItem value='active'>启用</SelectItem>)

    expect(html).toContain('cursor-pointer')
    expect(html).not.toContain('cursor-default')
  })
})
