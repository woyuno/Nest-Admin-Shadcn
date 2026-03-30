'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
import { PasswordInput } from '@/components/password-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SelectDropdown } from '@/components/select-dropdown'
import { Textarea } from '@/components/ui/textarea'
import {
  createUser,
  fetchUserDeptTree,
  fetchUserDetail,
  fetchUserMeta,
  updateUser,
  usersQueryKey,
} from '../api/users'
import {
  buildUserFormDefaults,
  buildUserSavePayload,
  flattenDeptOptions,
  type UserFormValues,
} from '../lib/user-form-contract'
import { type User } from '../data/schema'

const formSchema = z
  .object({
    userId: z.number().optional(),
    userName: z.string().min(2, '用户账号至少 2 位').max(20, '用户账号最多 20 位'),
    nickName: z.string().min(1, '用户昵称不能为空').max(30, '用户昵称最多 30 位'),
    password: z.string(),
    confirmPassword: z.string(),
    deptId: z.string().min(1, '请选择归属部门'),
    phonenumber: z
      .string()
      .regex(/^1\d{10}$/, '请输入正确的手机号码'),
    email: z.email('请输入正确的邮箱地址'),
    sex: z.string().min(1, '请选择性别'),
    status: z.string().min(1, '请选择状态'),
    postIds: z.array(z.string()),
    roleIds: z.array(z.string()).min(1, '至少选择一个角色'),
    remark: z.string().max(500, '备注最多 500 字'),
  })
  .superRefine((data, ctx) => {
    const isEdit = typeof data.userId === 'number'

    if (!isEdit && data.password.trim().length < 5) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: '新增用户时密码至少 5 位',
      })
    }

    if (data.password && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: '两次输入的密码不一致',
      })
    }
  })

const emptyValues: UserFormValues = {
  userName: '',
  nickName: '',
  password: '',
  confirmPassword: '',
  deptId: '',
  phonenumber: '',
  email: '',
  sex: '0',
  status: '0',
  postIds: [],
  roleIds: [],
  remark: '',
}

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow?.userId
  const queryClient = useQueryClient()
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  const userMetaQuery = useQuery({
    queryKey: ['users', 'meta'],
    queryFn: fetchUserMeta,
    enabled: open,
  })

  const deptTreeQuery = useQuery({
    queryKey: ['users', 'dept-tree'],
    queryFn: fetchUserDeptTree,
    enabled: open,
  })

  const userDetailQuery = useQuery({
    queryKey: ['users', 'detail', currentRow?.userId],
    queryFn: () => fetchUserDetail(currentRow!.userId!),
    enabled: open && isEdit,
  })

  useEffect(() => {
    if (!open) {
      form.reset(emptyValues)
      return
    }

    if (isEdit) {
      if (userDetailQuery.data) {
        form.reset(buildUserFormDefaults(userDetailQuery.data))
      }
      return
    }

    form.reset(emptyValues)
  }, [form, isEdit, open, userDetailQuery.data])

  const saveMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const payload = buildUserSavePayload(values)
      if (values.userId) {
        await updateUser(payload)
        return
      }

      await createUser(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey })
      onOpenChange(false)
      form.reset(emptyValues)
    },
  })

  const deptOptions = flattenDeptOptions(deptTreeQuery.data ?? [])
  const roleOptions = (userMetaQuery.data?.roles ?? [])
    .filter((item) => String(item.status ?? '0') === '0')
    .map((item) => ({
      label: item.roleName,
      value: String(item.roleId),
    }))
  const postOptions = (userMetaQuery.data?.posts ?? [])
    .filter((item) => String(item.status ?? '0') === '0')
    .map((item) => ({
      label: item.postName,
      value: String(item.postId),
    }))

  const loading = userMetaQuery.isLoading || deptTreeQuery.isLoading || (isEdit && userDetailQuery.isLoading)

  const onSubmit = (values: UserFormValues) => {
    saveMutation.mutate(values)
  }

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
          <DialogTitle>{isEdit ? '修改用户' : '新增用户'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '编辑现有用户资料、部门、岗位和角色。' : '创建新用户并分配部门、岗位和角色。'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex h-80 items-center justify-center text-muted-foreground'>
            <Loader2 className='me-2 size-4 animate-spin' />
            正在加载表单数据...
          </div>
        ) : (
          <ScrollArea className='h-[70vh] pe-4'>
            <Form {...form}>
              <form
                id='user-form'
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-5'
              >
                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='userName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>用户账号</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入用户账号' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='nickName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>用户昵称</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入用户昵称' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isEdit ? '登录密码' : '初始密码'}</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={isEdit ? '留空表示不修改密码' : '请输入登录密码'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>确认密码</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder='请再次输入密码' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='deptId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>归属部门</FormLabel>
                        <SelectDropdown
                          key={`dept-${field.value}-${deptOptions.length}`}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择归属部门'
                          className='w-full'
                          items={deptOptions}
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
                          key={`status-${field.value}`}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择状态'
                          className='w-full'
                          items={[
                            { label: '启用', value: '0' },
                            { label: '停用', value: '1' },
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
                    name='phonenumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>手机号码</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入手机号码' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='sex'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>性别</FormLabel>
                        <SelectDropdown
                          key={`sex-${field.value}`}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择性别'
                          className='w-full'
                          items={[
                            { label: '男', value: '0' },
                            { label: '女', value: '1' },
                            { label: '未知', value: '2' },
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
                  name='postIds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>岗位</FormLabel>
                      <div className='grid gap-3 rounded-md border p-3 md:grid-cols-2'>
                        {postOptions.map((item) => {
                          const checked = field.value.includes(item.value)
                          return (
                            <label
                              key={item.value}
                              className='flex items-center gap-2 text-sm'
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(next) => {
                                  field.onChange(
                                    next
                                      ? [...field.value, item.value]
                                      : field.value.filter((value) => value !== item.value)
                                  )
                                }}
                              />
                              <span>{item.label}</span>
                            </label>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='roleIds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色</FormLabel>
                      <div className='grid gap-3 rounded-md border p-3 md:grid-cols-2'>
                        {roleOptions.map((item) => {
                          const checked = field.value.includes(item.value)
                          return (
                            <label
                              key={item.value}
                              className='flex items-center gap-2 text-sm'
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(next) => {
                                  field.onChange(
                                    next
                                      ? [...field.value, item.value]
                                      : field.value.filter((value) => value !== item.value)
                                  )
                                }}
                              />
                              <span>{item.label}</span>
                            </label>
                          )
                        })}
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
              </form>
            </Form>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            取消
          </Button>
          <Button type='submit' form='user-form' disabled={saveMutation.isPending || loading}>
            {saveMutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建用户'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
