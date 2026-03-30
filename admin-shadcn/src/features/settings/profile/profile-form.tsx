import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ProfileForm() {
  const user = useAuthStore((state) => state.auth.user)
  const roles = user?.roles ?? []
  const permissions = user?.permissions ?? []

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='profile-display-name'>显示名称</Label>
          <Input
            id='profile-display-name'
            value={user?.displayName || ''}
            readOnly
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='profile-username'>登录账号</Label>
          <Input
            id='profile-username'
            value={user?.userName || ''}
            readOnly
          />
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='profile-dept'>所属部门</Label>
          <Input id='profile-dept' value={user?.deptName || '未分配'} readOnly />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='profile-roles'>角色列表</Label>
          <Input
            id='profile-roles'
            value={roles.join(' / ') || '未识别角色'}
            readOnly
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='profile-permissions'>权限概况</Label>
        <Textarea
          id='profile-permissions'
          className='min-h-32 resize-none'
          value={
            permissions.length
              ? permissions.join('\n')
              : '当前没有可展示的权限标识。'
          }
          readOnly
        />
        <p className='text-sm text-muted-foreground'>
          当前共识别到 {permissions.length} 个权限点。
        </p>
      </div>

      <div className='flex flex-wrap gap-2'>
        <Button asChild>
          <Link to='/user/profile'>刷新资料页</Link>
        </Button>
        <Button asChild variant='outline'>
          <Link to='/settings/account'>查看账户信息</Link>
        </Button>
        <Button asChild variant='secondary'>
          <Link to='/'>返回首页</Link>
        </Button>
      </div>
    </div>
  )
}
