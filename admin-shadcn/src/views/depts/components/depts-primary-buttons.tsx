import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import { useDepts } from './depts-provider'

type DeptsPrimaryButtonsProps = {
  isExpandedAll: boolean
  onToggleExpandAll: () => void
}

export function DeptsPrimaryButtons({
  isExpandedAll,
  onToggleExpandAll,
}: DeptsPrimaryButtonsProps) {
  const { setOpen, setParentRow } = useDepts()

  return (
    <div className='flex flex-wrap gap-2'>
      <PermissionGuard permissions={['system:dept:add']}>
        <Button
          className='space-x-1'
          onClick={() => {
            setParentRow(null)
            setOpen('add')
          }}
        >
          <span>新增部门</span> <Plus size={18} />
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

