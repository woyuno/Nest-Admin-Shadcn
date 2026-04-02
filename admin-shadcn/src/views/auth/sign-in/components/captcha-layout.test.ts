import { describe, expect, it } from 'vitest'
import { getCaptchaActionMode } from './captcha-layout'

describe('captcha-layout', () => {
  it('uses image-only captcha actions without a separate refresh button', () => {
    expect(getCaptchaActionMode()).toBe('image-only')
  })
})
