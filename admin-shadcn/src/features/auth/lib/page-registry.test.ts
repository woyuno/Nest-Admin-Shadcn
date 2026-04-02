import { describe, expect, it } from 'vitest'
import { frontendPageRegistry } from './page-registry'

describe('page-registry', () => {
  it('does not expose legacy code generator routes', () => {
    const legacyEntries = frontendPageRegistry.filter(
      (item) =>
        item.routePath === '/tool/gen' ||
        (item.menuPaths ?? []).includes('/tool/gen') ||
        (item.componentKeys ?? []).includes('tool/gen/index')
    )

    expect(legacyEntries).toEqual([])
  })
})
