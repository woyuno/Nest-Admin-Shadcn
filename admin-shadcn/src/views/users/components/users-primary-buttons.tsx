import { useState } from 'react'
import { Edit, FileDown, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { downloadBlob } from '@/lib/download-blob'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import { exportUsers } from '../api/users'
import { type User } from '../data/schema'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'
import { useUsers } from './users-provider'

type UsersPrimaryButtonsProps = {
  search?: {
    page?: number
    pageSize?: number
    username?: string
    phonenumber?: string
    status?: Array<'active' | 'inactive'>
    deptId?: string
    beginTime?: string
    endTime?: string
  }
  selectedUsers?: User[]
  onClearSelection?: () => void
}

export function UsersPrimaryButtons({
  search = {},
  selectedUsers = [],
  onClearSelection,
}: UsersPrimaryButtonsProps) {
  const { setOpen, setCurrentRow } = useUsers()
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedCount = selectedUsers.length
  const singleSelectedUser = selectedCount === 1 ? selectedUsers[0] : null

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const blob = await exportUsers(search)
      downloadBlob(blob, `用户列表-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('用户导出任务已完成')
    } finally {
      setIsExporting(false)
    }
  }

  const handleEdit = () => {
    if (!singleSelectedUser) {
      toast.error('请选择一条需要修改的用户记录')
      return
    }

    setCurrentRow(singleSelectedUser)
    setOpen('edit')
  }

  const handleDelete = () => {
    if (selectedCount === 0) {
      toast.error('请先选择需要删除的用户')
      return
    }

    if (selectedCount === 1 && singleSelectedUser) {
      setCurrentRow(singleSelectedUser)
      setOpen('delete')
      return
    }

    setShowDeleteConfirm(true)
  }

  return (
    <>
      <div className='flex flex-wrap gap-2'>
        <PermissionGuard permissions={['system:user:add']}>
          <Button className='space-x-1' onClick={() => setOpen('add')}>
            <span>新增</span> <UserPlus size={18} />
          </Button>
        </PermissionGuard>
        <PermissionGuard permissions={['system:user:edit']}>
          <Button
            variant='outline'
            className='space-x-1'
            onClick={handleEdit}
            disabled={!singleSelectedUser}
          >
            <span>修改</span> <Edit size={18} />
          </Button>
        </PermissionGuard>
        <PermissionGuard permissions={['system:user:remove']}>
          <Button
            variant='destructive'
            className='space-x-1'
            onClick={handleDelete}
            disabled={selectedCount === 0}
          >
            <span>删除</span> <Trash2 size={18} />
          </Button>
        </PermissionGuard>
        <PermissionGuard permissions={['system:user:export']}>
          <Button
            variant='secondary'
            className='space-x-1'
            onClick={handleExport}
            disabled={isExporting}
          >
            <span>{isExporting ? '导出中' : '导出用户'}</span>{' '}
            <FileDown size={18} />
          </Button>
        </PermissionGuard>
      </div>
      <UsersMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        selectedUsers={selectedUsers}
        onDeleted={() => onClearSelection?.()}
      />
    </>
  )
}

