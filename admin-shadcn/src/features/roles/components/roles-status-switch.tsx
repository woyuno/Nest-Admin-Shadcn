import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { changeRoleStatus, rolesQueryKey } from '../api/roles'
import { type Role } from '../data/schema'

type RolesStatusSwitchProps = {
  role: Role
}

export function RolesStatusSwitch({ role }: RolesStatusSwitchProps) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (enabled: boolean) =>
      changeRoleStatus({ roleId: role.roleId, enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKey })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '状态更新失败')
    },
  })

  return (
    <Switch
      checked={role.status === 'active'}
      onCheckedChange={(checked) => mutation.mutate(checked)}
      disabled={mutation.isPending || role.roleId === 1}
      aria-label={`切换角色 ${role.roleName} 状态`}
    />
  )
}
