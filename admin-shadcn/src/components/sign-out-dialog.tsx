import { useNavigate, useLocation } from '@tanstack/react-router'
import { toast } from 'sonner'
import { logoutByToken } from '@/views/auth/api/auth'
import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await logoutByToken()
    } catch {
      toast.error('退出登录失败，请稍后重试')
      return
    }

    auth.reset()
    const currentPath = location.href
    navigate({
      to: '/sign-in',
      search: { redirect: currentPath },
      replace: true,
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='退出登录'
      desc='确认退出当前账号吗？退出后需要重新登录才能继续访问后台。'
      confirmText='确认退出'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}

