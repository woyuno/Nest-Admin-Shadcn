import { request } from '@/lib/request'
import {
  buildLoginPayload,
  normalizeCaptchaResponse,
  normalizeUserInfoResponse,
} from '../lib/auth-contract'
import { type BackendMenuRoute } from '../lib/authorization-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type LoginResponseData = {
  token: string
  userName: string
}

export async function fetchCaptcha() {
  const response = await request.get<
    ApiEnvelope<{
      captchaEnabled: boolean
      img: string
      uuid: string
    }>
  >('/captchaImage')

  return normalizeCaptchaResponse(response.data)
}

export async function loginByPassword(input: {
  userName: string
  password: string
  code?: string
  uuid?: string
}) {
  const response = await request.post<ApiEnvelope<LoginResponseData>>(
    '/login',
    buildLoginPayload(input)
  )

  return response.data.data
}

export async function fetchCurrentUserInfo() {
  const response = await request.get('/getInfo')
  return normalizeUserInfoResponse(response.data)
}

export async function fetchCurrentRouters() {
  const response =
    await request.get<ApiEnvelope<BackendMenuRoute[]>>('/getRouters')
  return response.data.data || []
}

export async function logoutByToken() {
  await request.post('/logout')
}
