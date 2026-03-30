import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function extractServerErrorMessage(error: unknown) {
  let errMsg = '操作失败，请稍后重试'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    return '未找到对应内容'
  }

  if (error instanceof AxiosError) {
    return (
      error.response?.data?.msg ||
      error.response?.data?.title ||
      error.message ||
      errMsg
    )
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return errMsg
}

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)
  toast.error(extractServerErrorMessage(error))
}
