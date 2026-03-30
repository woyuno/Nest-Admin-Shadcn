type ShouldShowDevtoolsInput = {
  isDev: boolean
  enabledFlag?: string
}

export function shouldShowDevtools({
  isDev,
  enabledFlag,
}: ShouldShowDevtoolsInput) {
  return isDev && enabledFlag === 'true'
}
