import { describe, expect, it } from 'vitest'
import { appearanceContent } from './appearance/appearance-copy'
import { sidebarNavItems } from './index'

describe('settings navigation', () => {
  it('keeps only useful personal center sections in the sidebar', () => {
    expect(sidebarNavItems.map((item) => item.title)).toEqual([
      '个人资料',
      '账户信息',
      '外观设置',
    ])
  })

  it('renders the appearance page copy in Chinese', () => {
    expect(appearanceContent).toMatchObject({
      title: '外观设置',
      description: '自定义系统的主题与字体偏好，可在浅色与深色模式之间切换。',
      fontLabel: '界面字体',
      themeLabel: '主题模式',
      lightLabel: '浅色',
      darkLabel: '深色',
      submitLabel: '保存外观设置',
    })
  })
})
