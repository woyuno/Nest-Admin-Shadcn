import { describe, expect, it } from 'vitest'
import {
  buildLoginPayload,
  getPostLoginRedirect,
  isProtectedPath,
  normalizeCaptchaResponse,
  normalizeUserInfoResponse,
  shouldEnableCaptcha,
} from './auth-contract'

describe('auth-contract', () => {
  it('normalizes captcha response from the current backend contract', () => {
    const result = normalizeCaptchaResponse({
      code: 200,
      msg: '操作成功',
      data: {
        captchaEnabled: true,
        img: '<svg />',
        uuid: 'captcha-uuid',
      },
    })

    expect(result).toEqual({
      captchaEnabled: true,
      image: '<svg />',
      uuid: 'captcha-uuid',
    })
  })

  it('allows frontend to force disable captcha during local development', () => {
    expect(
      shouldEnableCaptcha({
        backendEnabled: true,
        disableCaptchaLogin: true,
      })
    ).toBe(false)
  })

  it('keeps captcha enabled when backend requires it and frontend does not disable it', () => {
    expect(
      shouldEnableCaptcha({
        backendEnabled: true,
        disableCaptchaLogin: false,
      })
    ).toBe(true)
  })

  it('normalizes user info response from the current backend contract', () => {
    const result = normalizeUserInfoResponse({
      code: 200,
      msg: '操作成功',
      roles: ['admin'],
      permissions: ['system:user:list'],
      user: {
        userId: 1,
        userName: 'admin',
        nickName: '管理员',
        deptId: 100,
        dept: {
          deptName: '研发部',
        },
      },
    })

    expect(result).toEqual({
      id: 1,
      userName: 'admin',
      displayName: '管理员',
      deptId: 100,
      deptName: '研发部',
      roles: ['admin'],
      permissions: ['system:user:list'],
      profile: {
        userId: 1,
        userName: 'admin',
        nickName: '管理员',
        deptId: 100,
        dept: {
          deptName: '研发部',
        },
      },
    })
  })

  it('builds login payload using backend field names', () => {
    const result = buildLoginPayload({
      userName: 'admin',
      password: '123456',
      code: 'ABCD',
      uuid: 'captcha-uuid',
    })

    expect(result).toEqual({
      userName: 'admin',
      password: '123456',
      code: 'ABCD',
      uuid: 'captcha-uuid',
    })
  })

  it('uses dashboard as fallback redirect after login', () => {
    expect(getPostLoginRedirect(undefined)).toBe('/')
    expect(getPostLoginRedirect('')).toBe('/')
  })

  it('rejects auth pages as redirect targets after login', () => {
    expect(getPostLoginRedirect('/sign-in')).toBe('/')
    expect(getPostLoginRedirect('/forgot-password')).toBe('/')
  })

  it('treats authenticated app routes as protected paths', () => {
    expect(isProtectedPath('/')).toBe(true)
    expect(isProtectedPath('/users')).toBe(true)
    expect(isProtectedPath('/settings')).toBe(true)
  })

  it('treats auth and error routes as public paths', () => {
    expect(isProtectedPath('/sign-in')).toBe(false)
    expect(isProtectedPath('/forgot-password')).toBe(false)
    expect(isProtectedPath('/401')).toBe(false)
  })
})
