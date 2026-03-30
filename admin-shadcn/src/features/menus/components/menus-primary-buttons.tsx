import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/features/auth/components/permission-guard'
import { useMenus } from './menus-provider'

type MenusPrimaryButtonsProps = {
  isExpandedAll: boolean
  onToggleExpandAll: () => void
}

export function MenusPrimaryButtons({
  isExpandedAll,
  onToggleExpandAll,
}: MenusPrimaryButtonsProps) {
  const { setOpen, setParentRow } = useMenus()

  return (
    <div className='flex flex-wrap gap-2'>
      <PermissionGuard permissions={['system:menu:add']}>
        <Button
          className='space-x-1'
          onClick={() => {
            setParentRow(null)
            setOpen('add')
          }}
        >
          <span>新增菜单</span> <Plus size={18} />
        </Button>
      </PermissionGuard>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={onToggleExpandAll}
      >
        <span>{isExpandedAll ? '折叠全部' : '展开全部'}</span>{' '}
        {isExpandedAll ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Button>
    </div>
  )
}
