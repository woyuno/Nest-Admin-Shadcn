import { describe, expect, it } from 'vitest'
import {
  getSettingsProfileEntryPath,
  getSettingsProfileRedirectTarget,
} from './settings-paths'

describe('settings profile paths', () => {
  it('uses the settings index page as the primary personal profile entry', () => {
    expect(getSettingsProfileEntryPath()).toBe('/settings')
  })

  it('redirects the legacy profile route into the settings layout', () => {
    expect(getSettingsProfileRedirectTarget('/user/profile')).toBe('/settings')
  })
})
