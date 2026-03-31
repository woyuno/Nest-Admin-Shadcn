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
  createNotice,
  fetchNoticeDetail,
  noticeDetailQueryKey,
  noticesQueryKey,
  updateNotice,
} from '../api/notices'
import { type Notice } from '../data/schema'
import { type NoticeFormValues } from '../lib/notice-contract'

const formSchema = z.object({
  noticeId: z.number().optional(),
  noticeTitle: z.string().min(1, '公告标题不能为空').max(128, '公告标题最多 128 位'),
  noticeType: z.union([z.literal('notice'), z.literal('announcement')]),
  status: z.union([z.literal('published'), z.literal('draft')]),
  noticeContent: z.string().min(1, '公告内容不能为空'),
})

const emptyValues: NoticeFormValues = {
  noticeTitle: '',
  noticeType: 'notice',
  status: 'published',
  noticeContent: '',
}

type NoticesActionDialogProps = {
  currentRow?: Notice
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NoticesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: NoticesActionDialogProps) {
  const isEdit = !!currentRow?.noticeId
  const queryClient = useQueryClient()
  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  const detailQuery = useQuery({
    queryKey: noticeDetailQueryKey(currentRow?.noticeId),
    queryFn: () => fetchNoticeDetail(currentRow!.noticeId),
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
              noticeId: currentRow.noticeId,
              noticeTitle: currentRow.noticeTitle,
              noticeType: currentRow.noticeType,
              status: currentRow.status,
              noticeContent: currentRow.noticeContent,
            }
          : undefined,
      })
    )
  }, [currentRow, detailQuery.data, form, isEdit, open])

  const saveMutation = useMutation({
    mutationFn: async (values: NoticeFormValues) => {
      if (values.noticeId) {
        await updateNotice(values)
        return
      }
      await createNotice(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticesQueryKey })
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
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '修改公告' : '新增公告'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新公告标题、类型、状态和内容。' : '创建新公告并填写标题、类型和内容。'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='notice-form'
            onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
            className='space-y-5'
          >
              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='noticeTitle'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>公告标题</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入公告标题' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='noticeType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>公告类型</FormLabel>
                      <SelectDropdown
                        key={`notice-type-${field.value}`}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择公告类型'
                        className='w-full'
                        items={[
                          { label: '通知', value: 'notice' },
                          { label: '公告', value: 'announcement' },
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
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <SelectDropdown
                      key={`notice-status-${field.value}`}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='请选择状态'
                      className='w-full'
                      items={[
                        { label: '正常发布', value: 'published' },
                        { label: '停用草稿', value: 'draft' },
                      ]}
                      isControlled
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='noticeContent'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>公告内容</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='请输入公告内容'
                        className='min-h-48'
                        {...field}
                      />
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
            form='notice-form'
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建公告'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
