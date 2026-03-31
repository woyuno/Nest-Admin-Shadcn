export const settingsProfilePath = '/settings'
export const legacySettingsProfilePath = '/user/profile'

export function getSettingsProfileEntryPath() {
  return settingsProfilePath
}

export function getSettingsProfileRedirectTarget(pathname: string) {
  if (pathname === legacySettingsProfilePath) {
    return settingsProfilePath
  }

  return pathname
}
