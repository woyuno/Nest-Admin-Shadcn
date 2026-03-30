type CaptchaApiResponse = {
  code: number
  msg: string
  data?: {
    captchaEnabled?: boolean
    img?: string
    uuid?: string
  }
}

type UserInfoApiResponse = {
  code: number
  msg: string
  roles?: string[]
  permissions?: string[]
  user?: {
    userId?: number
    userName?: string
    nickName?: string
    deptId?: number
    dept?: {
      deptName?: string
    }
  } & Record<string, unknown>
}

type LoginFormInput = {
  userName: string
  password: string
  code?: string
  uuid?: string
}

const PUBLIC_PATH_PREFIXES = ['/sign-in', '/sign-in-2', '/sign-up', '/forgot-password', '/otp', '/401', '/403', '/404', '/500', '/503']

export function normalizeCaptchaResponse(response: CaptchaApiResponse) {
  return {
    captchaEnabled: Boolean(response.data?.captchaEnabled),
    image: response.data?.img || '',
    uuid: response.data?.uuid || '',
  }
}

export function shouldEnableCaptcha(input: {
  backendEnabled: boolean
  disableCaptchaLogin: boolean
}) {
  return input.backendEnabled && !input.disableCaptchaLogin
}

export function normalizeUserInfoResponse(response: UserInfoApiResponse) {
  const profile = response.user || {}

  return {
    id: Number(profile.userId || 0),
    userName: String(profile.userName || ''),
    displayName: String(profile.nickName || profile.userName || ''),
    deptId: Number(profile.deptId || 0),
    deptName: String(profile.dept?.deptName || ''),
    roles: response.roles || [],
    permissions: response.permissions || [],
    profile,
  }
}

export function buildLoginPayload(input: LoginFormInput) {
  return {
    userName: input.userName,
    password: input.password,
    code: input.code || '',
    uuid: input.uuid || '',
  }
}

export function getPostLoginRedirect(redirect?: string) {
  if (!redirect) {
    return '/'
  }

  const isInvalidRedirect = PUBLIC_PATH_PREFIXES.some((prefix) =>
    redirect.startsWith(prefix)
  )

  return isInvalidRedirect ? '/' : redirect
}

export function isProtectedPath(pathname: string) {
  if (pathname === '/') {
    return true
  }

  return !PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
