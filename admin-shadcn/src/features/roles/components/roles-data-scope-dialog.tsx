'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  fetchRoleDeptTree,
  fetchRoleDetail,
  rolesQueryKey,
  updateRoleDataScope,
} from '../api/roles'
import { type Role } from '../data/schema'
import { RolesTreeSelector } from './roles-tree-selector'

const dataScopeOptions = [
  { value: '1', label: '全部数据权限' },
  { value: '2', label: '自定数据权限' },
  { value: '3', label: '本部门数据权限' },
  { value: '4', label: '本部门及以下数据权限' },
  { value: '5', label: '仅本人数据权限' },
]

type RolesDataScopeDialogProps = {
  currentRow: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolesDataScopeDialog({
  currentRow,
  open,
  onOpenChange,
}: RolesDataScopeDialogProps) {
  const queryClient = useQueryClient()
  const [dataScope, setDataScope] = useState('1')
  const [deptCheckStrictly, setDeptCheckStrictly] = useState(true)
  const [checkedDeptIds, setCheckedDeptIds] = useState<number[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const roleDetailQuery = useQuery({
    queryKey: ['roles', 'detail', currentRow.roleId],
    queryFn: () => fetchRoleDetail(currentRow.roleId),
    enabled: open,
  })

  const deptTreeQuery = useQuery({
    queryKey: ['roles', 'dept-tree', currentRow.roleId],
    queryFn: () => fetchRoleDeptTree(currentRow.roleId),
    enabled: open,
  })

  useEffect(() => {
    if (!open || !roleDetailQuery.data || !deptTreeQuery.data) {
      return
    }

    setDataScope(roleDetailQuery.data.dataScope ?? '1')
    setDeptCheckStrictly(roleDetailQuery.data.deptCheckStrictly ?? true)
    setCheckedDeptIds(deptTreeQuery.data.checkedKeys ?? [])
    setSubmitError(null)
  }, [deptTreeQuery.data, open, roleDetailQuery.data])

  const mutation = useMutation({
    mutationFn: async () => {
      await updateRoleDataScope({
        roleId: currentRow.roleId,
        roleName: roleDetailQuery.data?.roleName ?? currentRow.roleName,
        roleKey: roleDetailQuery.data?.roleKey ?? currentRow.roleKey,
        roleSort: roleDetailQuery.data?.roleSort ?? currentRow.roleSort,
        status: roleDetailQuery.data?.status ?? (currentRow.status === 'active' ? '0' : '1'),
        dataScope,
        deptCheckStrictly,
        menuCheckStrictly: roleDetailQuery.data?.menuCheckStrictly ?? true,
        remark: roleDetailQuery.data?.remark ?? '',
        deptIds: checkedDeptIds,
        menuIds: [],
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKey })
      setSubmitError(null)
      onOpenChange(false)
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : '保存数据权限失败')
    },
  })

  const loading = roleDetailQuery.isLoading || deptTreeQuery.isLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>数据权限</DialogTitle>
          <DialogDescription>为角色“{currentRow.roleName}”配置数据范围。</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className='py-10 text-center text-sm text-muted-foreground'>
            正在加载数据权限配置...
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>角色名称</label>
                <Input value={roleDetailQuery.data?.roleName ?? currentRow.roleName} disabled />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>权限字符</label>
                <Input value={roleDetailQuery.data?.roleKey ?? currentRow.roleKey} disabled />
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>权限范围</label>
              <Select value={dataScope} onValueChange={setDataScope}>
                <SelectTrigger>
                  <SelectValue placeholder='请选择权限范围' />
                </SelectTrigger>
                <SelectContent>
                  {dataScopeOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {dataScope === '2' ? (
              <div className='space-y-3'>
                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                  <Checkbox
                    checked={deptCheckStrictly}
                    onCheckedChange={(next) => setDeptCheckStrictly(Boolean(next))}
                  />
                  <span>父子联动</span>
                </label>
                <RolesTreeSelector
                  data={deptTreeQuery.data?.depts ?? []}
                  checkedIds={checkedDeptIds}
                  onCheckedIdsChange={setCheckedDeptIds}
                  strictMode={deptCheckStrictly}
                />
              </div>
            ) : null}
            {submitError ? (
              <p className='text-sm text-destructive'>{submitError}</p>
            ) : null}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            取消
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || loading}
          >
            {mutation.isPending ? '保存中...' : '保存权限'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
