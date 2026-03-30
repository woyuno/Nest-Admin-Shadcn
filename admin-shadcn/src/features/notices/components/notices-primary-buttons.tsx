import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/features/auth/components/permission-guard'
import { useNotices } from './notices-provider'

export function NoticesPrimaryButtons() {
  const { setOpen } = useNotices()

  return (
    <div className='flex gap-2'>
      <PermissionGuard permissions={['system:notice:add']}>
        <Button className='space-x-1' onClick={() => setOpen('add')}>
          <span>新增公告</span> <Plus size={18} />
        </Button>
      </PermissionGuard>
    </div>
  )
}
