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
  configDetailQueryKey,
  configsQueryKey,
  createConfig,
  fetchConfigDetail,
  updateConfig,
} from '../api/configs'
import { type Config } from '../data/schema'
import { type ConfigFormValues } from '../lib/config-contract'

const formSchema = z.object({
  configId: z.number().optional(),
  configName: z.string().min(1, '参数名称不能为空').max(128, '参数名称最多 128 位'),
  configKey: z.string().min(1, '参数键名不能为空').max(128, '参数键名最多 128 位'),
  configValue: z.string().min(1, '参数键值不能为空').max(255, '参数键值最多 255 位'),
  configType: z.union([z.literal('builtIn'), z.literal('custom')]),
  remark: z.string().max(500, '备注最多 500 字'),
})

const emptyValues: ConfigFormValues = {
  configName: '',
  configKey: '',
  configValue: '',
  configType: 'builtIn',
  remark: '',
}

type ConfigsActionDialogProps = {
  currentRow?: Config
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfigsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ConfigsActionDialogProps) {
  const isEdit = !!currentRow?.configId
  const queryClient = useQueryClient()
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  const detailQuery = useQuery({
    queryKey: configDetailQueryKey(currentRow?.configId),
    queryFn: () => fetchConfigDetail(currentRow!.configId),
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
              configId: currentRow.configId,
              configName: currentRow.configName,
              configKey: currentRow.configKey,
              configValue: currentRow.configValue,
              configType: currentRow.configType,
              remark: currentRow.remark,
            }
          : undefined,
      })
    )
  }, [currentRow, detailQuery.data, form, isEdit, open])

  const saveMutation = useMutation({
    mutationFn: async (values: ConfigFormValues) => {
      if (values.configId) {
        await updateConfig(values)
        return
      }
      await createConfig(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configsQueryKey })
      onOpenChange(false)
      form.reset(emptyValues)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!saveMutation.isPending) {
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '修改参数' : '新增参数'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新参数名称、键名、键值和内置属性。' : '创建新参数并设置系统内置属性。'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='config-form'
            onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
            className='space-y-5'
          >
              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='configName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>参数名称</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入参数名称' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='configKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>参数键名</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入参数键名' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='configValue'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>参数键值</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入参数键值' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='configType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>系统内置</FormLabel>
                      <SelectDropdown
                        key={`config-type-${field.value}`}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择内置属性'
                        className='w-full'
                        items={[
                          { label: '是，不可删除', value: 'builtIn' },
                          { label: '否，可删除', value: 'custom' },
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
          </form>
        </Form>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            取消
          </Button>
          <Button
            type='submit'
            form='config-form'
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建参数'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
