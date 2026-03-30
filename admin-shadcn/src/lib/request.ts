import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

request.interceptors.response.use(
  (response) => {
    const data = response.data

    if (data && typeof data === 'object' && 'code' in data && data.code !== 200) {
      return Promise.reject(new Error(String(data.msg || '请求失败')))
    }

    return response
  },
  (error) => Promise.reject(error)
)
