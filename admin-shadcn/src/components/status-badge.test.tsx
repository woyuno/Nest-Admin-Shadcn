import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  ActiveStatusBadge,
  BooleanBadge,
  MenuTypeBadge,
  NoticeTypeBadge,
  OperlogStatusBadge,
  PublishStatusBadge,
  SuccessStatusBadge,
  TaskStatusBadge,
  VisibilityBadge,
} from './status-badge'

describe('status-badge', () => {
  it('renders active/inactive states with user-style tones', () => {
    const activeHtml = renderToStaticMarkup(<ActiveStatusBadge status='active' />)
    const inactiveHtml = renderToStaticMarkup(<ActiveStatusBadge status='inactive' />)

    expect(activeHtml).toContain('启用')
    expect(activeHtml).toContain('bg-teal-100/30')
    expect(inactiveHtml).toContain('停用')
    expect(inactiveHtml).toContain('bg-neutral-300/40')
  })

  it('renders other supported status groups consistently', () => {
    expect(renderToStaticMarkup(<PublishStatusBadge status='published' />)).toContain(
      '正常发布'
    )
    expect(renderToStaticMarkup(<SuccessStatusBadge status='error' />)).toContain('失败')
    expect(renderToStaticMarkup(<OperlogStatusBadge status='success' />)).toContain('正常')
    expect(renderToStaticMarkup(<TaskStatusBadge status='paused' />)).toContain('暂停')
  })

  it('renders boolean, visibility and type badges with consistent tones', () => {
    expect(renderToStaticMarkup(<BooleanBadge value />)).toContain('是')
    expect(renderToStaticMarkup(<VisibilityBadge visible='hide' />)).toContain('隐藏')
    expect(renderToStaticMarkup(<MenuTypeBadge menuType='directory' />)).toContain('目录')
    expect(renderToStaticMarkup(<NoticeTypeBadge noticeType='notice' />)).toContain('通知')
  })
})
