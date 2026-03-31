'use client'

import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TreeSelect, type TreeSelectNode } from '@/components/tree-select'
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
import { SelectDropdown } from '@/components/select-dropdown'
import {
  createDept,
  deptsQueryKey,
  fetchDeptDetail,
  fetchDeptTreeOptions,
  fetchDeptTreeOptionsExcludeChild,
  updateDept,
} from '../api/depts'
import { type Dept } from '../data/schema'
import { type DeptFormValues } from '../lib/dept-contract'

const formSchema = z.object({
  deptId: z.number().optional(),
  parentId: z.string().min(1, '上级部门不能为空'),
  deptName: z.string().min(1, '部门名称不能为空').max(64, '部门名称最多 64 位'),
  orderNum: z.number().int().min(0, '显示排序不能小于 0'),
  leader: z.string().max(20, '负责人最多 20 位'),
  phone: z
    .string()
    .refine((value) => !value || /^1[3-9]\d{9}$/.test(value), '请输入正确的手机号码'),
  email: z
    .string()
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), '请输入正确的邮箱地址'),
  status: z.union([z.literal('active'), z.literal('inactive')]),
})

const emptyValues: DeptFormValues = {
  parentId: '0',
  deptName: '',
  orderNum: 0,
  leader: '',
  phone: '',
  email: '',
  status: 'active',
}

type DeptsActionDialogProps = {
  currentRow?: Dept
  parentRow?: Dept | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeptsActionDialog({
  currentRow,
  parentRow,
  open,
  onOpenChange,
}: DeptsActionDialogProps) {
  const isEdit = !!currentRow?.deptId
  const queryClient = useQueryClient()
  const deptNameInputRef = useRef<HTMLInputElement | null>(null)
  const form = useForm<DeptFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  const treeOptionsQuery = useQuery({
    queryKey: ['depts', 'tree-options', isEdit ? currentRow?.deptId : 'add'],
    queryFn: () =>
      isEdit && currentRow?.deptId
        ? fetchDeptTreeOptionsExcludeChild(currentRow.deptId)
        : fetchDeptTreeOptions(),
    enabled: open,
  })

  const detailQuery = useQuery({
    queryKey: ['depts', 'detail', currentRow?.deptId],
    queryFn: () => fetchDeptDetail(currentRow!.deptId),
    enabled: open && isEdit,
  })

  useEffect(() => {
    if (!open) {
      form.reset(emptyValues)
      return
    }

    if (isEdit) {
      if (detailQuery.data) {
        form.reset(detailQuery.data)
      }
      return
    }

    form.reset({
      ...emptyValues,
      parentId: parentRow ? String(parentRow.deptId) : '0',
    })
  }, [detailQuery.data, form, isEdit, open, parentRow])

  const saveMutation = useMutation({
    mutationFn: async (values: DeptFormValues) => {
      if (values.deptId) {
        await updateDept(values)
        return
      }
      await createDept(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deptsQueryKey })
      onOpenChange(false)
      form.reset(emptyValues)
    },
  })

  const deptTreeSelectData: TreeSelectNode[] = (treeOptionsQuery.data ?? []).map(function mapDeptNode(
    node
  ): TreeSelectNode {
    return {
      id: String(node.deptId),
      label: node.deptName,
      children: (node.children ?? []).map(mapDeptNode),
    }
  })
  const loading = treeOptionsQuery.isLoading || (isEdit && detailQuery.isLoading)

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!saveMutation.isPending) {
          onOpenChange(state)
        }
      }}
    >
      <DialogContent
        className='sm:max-w-2xl'
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          deptNameInputRef.current?.focus()
        }}
      >
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '修改部门' : '新增部门'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新部门名称、上级部门、负责人和联系信息。' : '创建新部门并设置上级部门和基础信息。'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex h-48 items-center justify-center text-muted-foreground'>
            <Loader2 className='me-2 size-4 animate-spin' />
            正在加载部门信息...
          </div>
        ) : (
          <Form {...form}>
            <form
              id='dept-form'
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className='space-y-5'
            >
              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='parentId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>上级部门</FormLabel>
                      <TreeSelect
                        key={`dept-parent-${field.value}-${deptTreeSelectData.length}`}
                        data={deptTreeSelectData}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择上级部门'
                        rootOption={{ label: '顶级部门', value: '0' }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='deptName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部门名称</FormLabel>
                      <FormControl>
                        <Input
                          ref={deptNameInputRef}
                          placeholder='请输入部门名称'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='orderNum'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>显示排序</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          placeholder='请输入显示排序'
                          value={String(field.value ?? 0)}
                          onChange={(event) => field.onChange(Number(event.target.value))}
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
                      <FormLabel>部门状态</FormLabel>
                      <SelectDropdown
                        key={`dept-status-${field.value}`}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择部门状态'
                        className='w-full'
                        items={[
                          { label: '启用', value: 'active' },
                          { label: '停用', value: 'inactive' },
                        ]}
                        isControlled
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='leader'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>负责人</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入负责人' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>联系电话</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入联系电话' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input placeholder='请输入邮箱地址' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            取消
          </Button>
          <Button type='submit' form='dept-form' disabled={saveMutation.isPending || loading}>
            {saveMutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建部门'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
