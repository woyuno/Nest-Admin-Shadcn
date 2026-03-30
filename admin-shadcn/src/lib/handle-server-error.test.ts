import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { extractServerErrorMessage } from './handle-server-error'

describe('extractServerErrorMessage', () => {
  it('uses generic error message when provided', () => {
    expect(extractServerErrorMessage(new Error('系统角色不可停用'))).toBe(
      '系统角色不可停用'
    )
  })

  it('reads message from axios response payload', () => {
    const error = new AxiosError('Request failed')
    error.response = {
      data: { msg: '删除失败' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
    }

    expect(extractServerErrorMessage(error)).toBe('删除失败')
  })
})
