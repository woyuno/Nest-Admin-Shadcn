'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { resolveDialogFormState } from '@/lib/dialog-form-state'
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
import { Textarea } from '@/components/ui/textarea'
import {
  createDictType,
  dictsQueryKey,
  dictTypeDetailQueryKey,
  fetchDictTypeDetail,
  updateDictType,
} from '../api/dicts'
import { type DictType } from '../data/schema'
import { type DictTypeFormValues } from '../lib/dict-contract'

const formSchema = z.object({
  dictId: z.number().optional(),
  dictName: z.string().min(1, '字典名称不能为空').max(100, '字典名称最多 100 位'),
  dictType: z.string().min(1, '字典类型不能为空').max(100, '字典类型最多 100 位'),
  status: z.union([z.literal('active'), z.literal('inactive')]),
  remark: z.string().max(500, '备注最多 500 字'),
})

const emptyValues: DictTypeFormValues = {
  dictName: '',
  dictType: '',
  status: 'active',
  remark: '',
}

type DictTypeActionDialogProps = {
  currentRow?: DictType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DictTypeActionDialog({
  currentRow,
  open,
  onOpenChange,
}: DictTypeActionDialogProps) {
  const isEdit = !!currentRow?.dictId
  const queryClient = useQueryClient()
  const form = useForm<DictTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  const detailQuery = useQuery({
    queryKey: dictTypeDetailQueryKey(currentRow?.dictId),
    queryFn: () => fetchDictTypeDetail(currentRow!.dictId),
    enabled: open && isEdit,
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    form.reset(
      resolveDialogFormState({
        open,
        isEdit,
        emptyValues,
        detailValues: detailQuery.data,
        draftValues: currentRow
          ? {
              dictId: currentRow.dictId,
              dictName: currentRow.dictName,
              dictType: currentRow.dictType,
              status: currentRow.status,
              remark: currentRow.remark,
            }
          : undefined,
      })
    )
  }, [currentRow, detailQuery.data, form, isEdit, open])

  const saveMutation = useMutation({
    mutationFn: async (values: DictTypeFormValues) => {
      if (values.dictId) {
        await updateDictType(values)
        return
      }
      await createDictType(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictsQueryKey })
      onOpenChange(false)
      form.reset(emptyValues)
    },
  })

  return (
    <Dialog open={open} onOpenChange={(state) => !saveMutation.isPending && onOpenChange(state)}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '修改字典类型' : '新增字典类型'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新字典名称、字典类型和状态。' : '创建新的字典类型供页面和表单复用。'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='dict-type-form'
            onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
            className='space-y-5'
          >
              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='dictName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>字典名称</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入字典名称' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='dictType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>字典类型</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入字典类型' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <SelectDropdown
                      key={`dict-type-status-${field.value}`}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='请选择状态'
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

              <FormField
                control={form.control}
                name='remark'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>备注</FormLabel>
                    <FormControl>
                      <Textarea placeholder='请输入备注' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </form>
        </Form>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={saveMutation.isPending}>
            取消
          </Button>
          <Button type='submit' form='dict-type-form' disabled={saveMutation.isPending}>
            {saveMutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建字典类型'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
