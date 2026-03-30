import { describe, expect, it, vi } from 'vitest'
import { refreshCurrentPage } from './refresh-current-page'

describe('refreshCurrentPage', () => {
  it('同时刷新当前活跃查询和当前路由', async () => {
    const queryClient = {
      refetchQueries: vi.fn().mockResolvedValue(undefined),
    }
    const router = {
      invalidate: vi.fn().mockResolvedValue(undefined),
    }

    await refreshCurrentPage({ queryClient, router })

    expect(queryClient.refetchQueries).toHaveBeenCalledWith({ type: 'active' })
    expect(router.invalidate).toHaveBeenCalledTimes(1)
  })
})
