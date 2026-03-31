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
  createDictData,
  dictDataDetailQueryKey,
  dictsQueryKey,
  fetchDictDataDetail,
  updateDictData,
} from '../api/dicts'
import { type DictData, type DictType } from '../data/schema'
import { type DictDataFormValues } from '../lib/dict-contract'

const formSchema = z.object({
  dictCode: z.number().optional(),
  dictSort: z.number().int().min(0, '字典排序不能小于 0'),
  dictLabel: z.string().min(1, '字典标签不能为空').max(100, '字典标签最多 100 位'),
  dictValue: z.string().min(1, '字典键值不能为空').max(100, '字典键值最多 100 位'),
  dictType: z.string().min(1, '字典类型不能为空'),
  cssClass: z.string().max(100, '样式属性最多 100 位'),
  listClass: z.string().max(100, '回显样式最多 100 位'),
  status: z.union([z.literal('active'), z.literal('inactive')]),
  remark: z.string().max(500, '备注最多 500 字'),
})

const emptyValues: DictDataFormValues = {
  dictSort: 0,
  dictLabel: '',
  dictValue: '',
  dictType: '',
  cssClass: '',
  listClass: 'default',
  status: 'active',
  remark: '',
}

type DictDataActionDialogProps = {
  selectedType?: DictType | null
  currentRow?: DictData
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DictDataActionDialog({
  selectedType,
  currentRow,
  open,
  onOpenChange,
}: DictDataActionDialogProps) {
  const isEdit = !!currentRow?.dictCode
  const queryClient = useQueryClient()
  const form = useForm<DictDataFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  const detailQuery = useQuery({
    queryKey: dictDataDetailQueryKey(currentRow?.dictCode),
    queryFn: () => fetchDictDataDetail(currentRow!.dictCode),
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
              dictCode: currentRow.dictCode,
              dictSort: currentRow.dictSort,
              dictLabel: currentRow.dictLabel,
              dictValue: currentRow.dictValue,
              dictType: currentRow.dictType,
              cssClass: currentRow.cssClass,
              listClass: currentRow.listClass,
              status: currentRow.status,
              remark: currentRow.remark,
            }
          : undefined,
        createValues: {
          ...emptyValues,
          dictType: selectedType?.dictType ?? '',
        },
      })
    )
  }, [currentRow, detailQuery.data, form, isEdit, open, selectedType])

  const saveMutation = useMutation({
    mutationFn: async (values: DictDataFormValues) => {
      if (values.dictCode) {
        await updateDictData(values)
        return
      }
      await createDictData(values)
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
          <DialogTitle>{isEdit ? '修改字典数据' : '新增字典数据'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新字典标签、键值、排序和状态。' : '为当前字典类型新增可选项。'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='dict-data-form'
            onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
            className='space-y-5'
          >
              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='dictType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>字典类型</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='dictSort'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>字典排序</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          value={String(field.value ?? 0)}
                          onChange={(event) => field.onChange(Number(event.target.value))}
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
                  name='dictLabel'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>字典标签</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入字典标签' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='dictValue'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>字典键值</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入字典键值' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='listClass'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>回显样式</FormLabel>
                      <SelectDropdown
                        key={`dict-data-list-class-${field.value}`}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择回显样式'
                        className='w-full'
                        items={[
                          { label: '默认', value: 'default' },
                          { label: '主色', value: 'primary' },
                          { label: '成功', value: 'success' },
                          { label: '信息', value: 'info' },
                          { label: '警告', value: 'warning' },
                          { label: '危险', value: 'danger' },
                        ]}
                        isControlled
                      />
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
                      <SelectDropdown
                        key={`dict-data-status-${field.value}`}
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
              </div>

              <FormField
                control={form.control}
                name='cssClass'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>样式属性</FormLabel>
                    <FormControl>
                      <Input placeholder='请输入样式属性，可留空' {...field} />
                    </FormControl>
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
          <Button type='submit' form='dict-data-form' disabled={saveMutation.isPending}>
            {saveMutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建字典数据'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
