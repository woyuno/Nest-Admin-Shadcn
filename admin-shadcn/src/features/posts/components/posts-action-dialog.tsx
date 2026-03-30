'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  createPost,
  fetchPostDetail,
  postsQueryKey,
  updatePost,
} from '../api/posts'
import { type Post } from '../data/schema'
import { type PostFormValues } from '../lib/post-contract'

const formSchema = z.object({
  postId: z.number().optional(),
  postCode: z.string().min(1, '岗位编码不能为空').max(64, '岗位编码最多 64 位'),
  postName: z.string().min(1, '岗位名称不能为空').max(64, '岗位名称最多 64 位'),
  postSort: z.number().int().min(0, '岗位排序不能小于 0'),
  status: z.union([z.literal('active'), z.literal('inactive')]),
  remark: z.string().max(500, '备注最多 500 字'),
})

const emptyValues: PostFormValues = {
  postCode: '',
  postName: '',
  postSort: 0,
  status: 'active',
  remark: '',
}

type PostsActionDialogProps = {
  currentRow?: Post
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: PostsActionDialogProps) {
  const isEdit = !!currentRow?.postId
  const queryClient = useQueryClient()
  const form = useForm<PostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  const detailQuery = useQuery({
    queryKey: ['posts', 'detail', currentRow?.postId],
    queryFn: () => fetchPostDetail(currentRow!.postId),
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

    form.reset(emptyValues)
  }, [detailQuery.data, form, isEdit, open])

  const saveMutation = useMutation({
    mutationFn: async (values: PostFormValues) => {
      if (values.postId) {
        await updatePost(values)
        return
      }
      await createPost(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKey })
      onOpenChange(false)
      form.reset(emptyValues)
    },
  })

  const loading = isEdit && detailQuery.isLoading

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!saveMutation.isPending) {
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '修改岗位' : '新增岗位'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新岗位名称、编码、排序和状态。' : '创建新岗位并设置基础属性。'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex h-48 items-center justify-center text-muted-foreground'>
            <Loader2 className='me-2 size-4 animate-spin' />
            正在加载岗位信息...
          </div>
        ) : (
          <Form {...form}>
            <form
              id='post-form'
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className='space-y-5'
            >
              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='postCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>岗位编码</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入岗位编码' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='postName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>岗位名称</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入岗位名称' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='postSort'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>显示顺序</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          placeholder='请输入显示顺序'
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
                      <FormLabel>状态</FormLabel>
                      <SelectDropdown
                        key={`post-status-${field.value}`}
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
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            取消
          </Button>
          <Button type='submit' form='post-form' disabled={saveMutation.isPending || loading}>
            {saveMutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建岗位'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
