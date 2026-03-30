'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { PasswordInput } from '@/components/password-input'
import { resetUserPassword, usersQueryKey } from '../api/users'
import { type User } from '../data/schema'

const formSchema = z
  .object({
    password: z.string().min(5, '重置密码至少 5 位').max(20, '重置密码最多 20 位'),
    confirmPassword: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: '两次输入的密码不一致',
      })
    }
  })

type ResetPasswordFormValues = z.infer<typeof formSchema>

const defaultValues: ResetPasswordFormValues = {
  password: '',
  confirmPassword: '',
}

type UsersResetPasswordDialogProps = {
  currentRow: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersResetPasswordDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersResetPasswordDialogProps) {
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: async (values: ResetPasswordFormValues) => {
      if (!currentRow.userId) {
        throw new Error('缺少用户标识，无法重置密码')
      }

      await resetUserPassword({
        userId: currentRow.userId,
        password: values.password,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey })
      form.reset(defaultValues)
      setSubmitError(null)
      onOpenChange(false)
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : '重置密码失败')
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!mutation.isPending) {
          if (!state) {
            form.reset(defaultValues)
            setSubmitError(null)
          }
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>重置密码</DialogTitle>
          <DialogDescription>
            为用户“{currentRow.userName ?? currentRow.username}”设置新的登录密码。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='reset-user-password-form'
            className='space-y-4'
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密码</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='请输入新密码' {...field} />
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
                    <PasswordInput placeholder='请再次输入新密码' {...field} />
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

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            取消
          </Button>
          <Button
            type='submit'
            form='reset-user-password-form'
            disabled={mutation.isPending}
          >
            {mutation.isPending ? '提交中...' : '确认重置'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
