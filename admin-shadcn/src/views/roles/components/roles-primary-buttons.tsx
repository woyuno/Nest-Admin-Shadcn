import { useState } from 'react'
import { Edit, FileDown, Trash2, UserRoundPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import { downloadBlob } from '@/lib/download-blob'
import {
  exportRoles,
  fetchRoleDetail,
  fetchRoleMenuTree,
  roleDetailQueryKey,
  roleMenuTreeQueryKey,
} from '../api/roles'
import { type Role } from '../data/schema'
import { type RolesSearch } from '../lib/role-contract'
import { RolesMultiDeleteDialog } from './roles-multi-delete-dialog'
import { useRoles } from './roles-provider'

type RolesPrimaryButtonsProps = {
  search?: RolesSearch
  selectedRoles?: Role[]
  onClearSelection?: () => void
}

export function RolesPrimaryButtons({
  search = {},
  selectedRoles = [],
  onClearSelection,
}: RolesPrimaryButtonsProps) {
  const { setOpen, setCurrentRow } = useRoles()
  const queryClient = useQueryClient()
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedCount = selectedRoles.length
  const singleSelectedRole = selectedCount === 1 ? selectedRoles[0] : null

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const blob = await exportRoles(search)
      downloadBlob(blob, `角色列表-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('角色导出任务已完成')
    } finally {
      setIsExporting(false)
    }
  }

  const handleEdit = () => {
    if (!singleSelectedRole) {
      toast.error('请选择一条需要修改的角色记录')
      return
    }

    void queryClient.prefetchQuery({
      queryKey: roleDetailQueryKey(singleSelectedRole.roleId),
      queryFn: () => fetchRoleDetail(singleSelectedRole.roleId),
      staleTime: 60_000,
    })
    void queryClient.prefetchQuery({
      queryKey: roleMenuTreeQueryKey(singleSelectedRole.roleId),
      queryFn: () => fetchRoleMenuTree(singleSelectedRole.roleId),
      staleTime: 60_000,
    })
    setCurrentRow(singleSelectedRole)
    setOpen('edit')
  }

  const handleDelete = () => {
    if (selectedCount === 0) {
      toast.error('请先选择需要删除的角色')
      return
    }

    if (selectedCount === 1 && singleSelectedRole) {
      setCurrentRow(singleSelectedRole)
      setOpen('delete')
      return
    }

    setShowDeleteConfirm(true)
  }

  return (
    <>
      <div className='flex flex-wrap gap-2'>
        <PermissionGuard permissions={['system:role:add']}>
          <Button className='space-x-1' onClick={() => setOpen('add')}>
            <span>新增</span> <UserRoundPlus size={18} />
          </Button>
        </PermissionGuard>
        <PermissionGuard permissions={['system:role:edit']}>
          <Button
            variant='outline'
            className='space-x-1'
            onClick={handleEdit}
            disabled={!singleSelectedRole}
          >
            <span>修改</span> <Edit size={18} />
          </Button>
        </PermissionGuard>
        <PermissionGuard permissions={['system:role:remove']}>
          <Button
            variant='destructive'
            className='space-x-1'
            onClick={handleDelete}
            disabled={selectedCount === 0}
          >
            <span>删除</span> <Trash2 size={18} />
          </Button>
        </PermissionGuard>
        <PermissionGuard permissions={['system:role:export']}>
          <Button
            variant='secondary'
            className='space-x-1'
            onClick={handleExport}
            disabled={isExporting}
          >
            <span>{isExporting ? '导出中' : '导出角色'}</span> <FileDown size={18} />
          </Button>
        </PermissionGuard>
      </div>
      <RolesMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        selectedRoles={selectedRoles}
        onDeleted={() => onClearSelection?.()}
      />
    </>
  )
}

