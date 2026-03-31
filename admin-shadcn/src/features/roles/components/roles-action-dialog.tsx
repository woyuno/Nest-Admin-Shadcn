'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  createRole,
  fetchMenuTree,
  fetchRoleDetail,
  fetchRoleMenuTree,
  roleBaseMenuTreeQueryKey,
  roleDetailQueryKey,
  roleMenuTreeQueryKey,
  rolesQueryKey,
  updateRole,
} from '../api/roles'
import { type Role } from '../data/schema'
import { RolesTreeSelector } from './roles-tree-selector'

const formSchema = z.object({
  roleId: z.number().optional(),
  roleName: z.string().min(1, '角色名称不能为空').max(30, '角色名称最多 30 位'),
  roleKey: z.string().min(1, '权限字符不能为空').max(100, '权限字符最多 100 位'),
  roleSort: z.number().min(0, '显示顺序不能小于 0'),
  status: z.string().min(1, '请选择状态'),
  remark: z.string().max(500, '备注最多 500 字'),
  menuCheckStrictly: z.boolean(),
})

type RoleFormValues = z.infer<typeof formSchema>

const defaultValues: RoleFormValues = {
  roleName: '',
  roleKey: '',
  roleSort: 0,
  status: '0',
  remark: '',
  menuCheckStrictly: true,
}

type RolesActionDialogProps = {
  currentRow?: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: RolesActionDialogProps) {
  const isEdit = typeof currentRow?.roleId === 'number'
  const queryClient = useQueryClient()
  const [localCheckedMenuIds, setLocalCheckedMenuIds] = useState<number[] | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const menuTreeQuery = useQuery({
    queryKey: roleBaseMenuTreeQueryKey,
    queryFn: fetchMenuTree,
    enabled: open,
    staleTime: 60_000,
  })

  const roleDetailQuery = useQuery({
    queryKey: roleDetailQueryKey(currentRow?.roleId),
    queryFn: () => fetchRoleDetail(currentRow!.roleId),
    enabled: open && isEdit,
    staleTime: 60_000,
  })

  const roleMenuTreeQuery = useQuery({
    queryKey: roleMenuTreeQueryKey(currentRow?.roleId),
    queryFn: () => fetchRoleMenuTree(currentRow!.roleId),
    enabled: open && isEdit,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues)
      return
    }

    if (!isEdit) {
      form.reset(defaultValues)
      return
    }

    if (currentRow) {
      form.reset({
        roleId: currentRow.roleId,
        roleName: currentRow.roleName,
        roleKey: currentRow.roleKey,
        roleSort: currentRow.roleSort ?? 0,
        status: currentRow.status === 'active' ? '0' : '1',
        remark: currentRow.remark ?? '',
        menuCheckStrictly: roleDetailQuery.data?.menuCheckStrictly ?? true,
      })
    }

    if (roleDetailQuery.data && roleMenuTreeQuery.data) {
      form.reset({
        roleId: roleDetailQuery.data.roleId,
        roleName: roleDetailQuery.data.roleName,
        roleKey: roleDetailQuery.data.roleKey,
        roleSort: roleDetailQuery.data.roleSort ?? 0,
        status: roleDetailQuery.data.status ?? '0',
        remark: roleDetailQuery.data.remark ?? '',
        menuCheckStrictly: roleDetailQuery.data.menuCheckStrictly ?? true,
      })
    }
  }, [currentRow, form, isEdit, open, roleDetailQuery.data, roleMenuTreeQuery.data])

  const saveMutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      if (checkedMenuIds.length === 0) {
        throw new Error('至少选择一个菜单权限')
      }

      const payload = {
        ...(values.roleId ? { roleId: values.roleId } : {}),
        roleName: values.roleName.trim(),
        roleKey: values.roleKey.trim(),
        roleSort: values.roleSort,
        status: values.status,
        remark: values.remark.trim(),
        menuIds: checkedMenuIds,
        menuCheckStrictly: values.menuCheckStrictly,
        deptCheckStrictly: true,
        dataScope: roleDetailQuery.data?.dataScope ?? '1',
        deptIds: [],
      }

      if (values.roleId) {
        await updateRole(payload)
        return
      }

      await createRole(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKey })
      form.reset(defaultValues)
      setLocalCheckedMenuIds(null)
      setSubmitError(null)
      onOpenChange(false)
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : '保存角色失败')
    },
  })

  const checkedMenuIds =
    localCheckedMenuIds ??
    (isEdit ? roleMenuTreeQuery.data?.checkedKeys ?? [] : [])

  const treeData = isEdit
    ? roleMenuTreeQuery.data?.menus ?? menuTreeQuery.data ?? []
    : menuTreeQuery.data ?? []

  const isTreeLoading =
    (isEdit && roleMenuTreeQuery.isLoading && treeData.length === 0) ||
    (!isEdit && menuTreeQuery.isLoading)

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!saveMutation.isPending) {
          if (!state) {
            setLocalCheckedMenuIds(null)
            setSubmitError(null)
          }
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '修改角色' : '新增角色'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新角色基本信息和菜单权限。' : '创建角色并配置菜单权限。'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[70vh] pe-4'>
          <Form {...form}>
            <form
              id='role-form'
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className='space-y-5'
            >
                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='roleName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>角色名称</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入角色名称' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='roleKey'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>权限字符</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入权限字符' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='roleSort'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>显示顺序</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            value={field.value}
                            onChange={(event) =>
                              field.onChange(Number(event.target.value || 0))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>状态</FormLabel>
                        <div className='flex h-10 items-center gap-4 rounded-md border px-3'>
                          <label className='flex items-center gap-2 text-sm'>
                            <input
                              type='radio'
                              checked={field.value === '0'}
                              onChange={() => field.onChange('0')}
                            />
                            启用
                          </label>
                          <label className='flex items-center gap-2 text-sm'>
                            <input
                              type='radio'
                              checked={field.value === '1'}
                              onChange={() => field.onChange('1')}
                            />
                            停用
                          </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='menuCheckStrictly'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(next) => field.onChange(Boolean(next))}
                        />
                        <span>父子联动</span>
                      </div>
                      <div className='pt-2'>
                        {isTreeLoading ? (
                          <div className='rounded-md border p-6 text-center text-sm text-muted-foreground'>
                            正在加载菜单权限...
                          </div>
                        ) : (
                          <RolesTreeSelector
                            data={treeData}
                            checkedIds={checkedMenuIds}
                            onCheckedIdsChange={setLocalCheckedMenuIds}
                            strictMode={field.value}
                          />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='remark'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>备注</FormLabel>
                      <FormControl>
                        <Textarea placeholder='请输入备注信息' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {submitError ? (
                  <p className='text-sm text-destructive'>{submitError}</p>
                ) : null}
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            取消
          </Button>
          <Button type='submit' form='role-form' disabled={saveMutation.isPending || isTreeLoading}>
            {saveMutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建角色'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
