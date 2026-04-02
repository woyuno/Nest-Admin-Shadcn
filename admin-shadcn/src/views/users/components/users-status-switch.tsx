import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import {
  changeUserStatus,
  usersQueryKey,
} from '../api/users'
import { type User } from '../data/schema'

type UsersStatusSwitchProps = {
  user: User
}

export function UsersStatusSwitch({ user }: UsersStatusSwitchProps) {
  const queryClient = useQueryClient()
  const userId = user.userId
  const enabled = user.status === 'active'

  const mutation = useMutation({
    mutationFn: (nextEnabled: boolean) => {
      if (!userId) {
        return Promise.reject(new Error('缺少用户 ID，无法修改状态'))
      }

      return changeUserStatus({ userId, enabled: nextEnabled })
    },
    onSuccess: (_, nextEnabled) => {
      toast.success(
        `${user.userName ?? user.username} 已${nextEnabled ? '启用' : '停用'}`
      )
      queryClient.invalidateQueries({ queryKey: usersQueryKey })
    },
  })

  if (!userId) {
    return (
      <span className='text-sm text-muted-foreground'>
        {enabled ? '启用' : '停用'}
      </span>
    )
  }

  return (
    <PermissionGuard permissions={['system:user:edit']}>
      <div className='flex items-center gap-2'>
        <Switch
          checked={enabled}
          disabled={mutation.isPending || userId === 1}
          aria-label={`${user.userName ?? user.username} 状态切换`}
          onCheckedChange={(nextEnabled) => mutation.mutate(nextEnabled)}
        />
        <span className='text-sm text-muted-foreground'>
          {enabled ? '启用' : '停用'}
        </span>
      </div>
    </PermissionGuard>
  )
}

