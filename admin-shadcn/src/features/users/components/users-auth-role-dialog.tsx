'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  fetchUserAuthRoles,
  updateUserAuthRoles,
  usersQueryKey,
} from '../api/users'
import { type User } from '../data/schema'

type UsersAuthRoleDialogProps = {
  currentRow: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersAuthRoleDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersAuthRoleDialogProps) {
  const queryClient = useQueryClient()
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const authRoleQuery = useQuery({
    queryKey: ['users', 'auth-role', currentRow.userId],
    queryFn: () => fetchUserAuthRoles(currentRow.userId!),
    enabled: open && typeof currentRow.userId === 'number',
  })

  const activeRoles = useMemo(
    () =>
      (authRoleQuery.data?.roles ?? []).filter(
        (role) => String(role.status ?? '0') === '0'
      ),
    [authRoleQuery.data?.roles]
  )

  useEffect(() => {
    if (!open || !authRoleQuery.data) {
      return
    }

    const roleIds = (authRoleQuery.data.user.roles ?? [])
      .map((role) => role.roleId)
      .filter((roleId) => typeof roleId === 'number')

    setSelectedRoleIds(roleIds)
    setSubmitError(null)
  }, [authRoleQuery.data, open])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!currentRow.userId) {
        throw new Error('缺少用户标识，无法分配角色')
      }

      await updateUserAuthRoles({
        userId: currentRow.userId,
        roleIds: selectedRoleIds,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey })
      queryClient.invalidateQueries({
        queryKey: ['users', 'auth-role', currentRow.userId],
      })
      setSubmitError(null)
      onOpenChange(false)
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : '分配角色失败')
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!mutation.isPending) {
          if (!state) {
            setSubmitError(null)
          }
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>分配角色</DialogTitle>
          <DialogDescription>
            为用户“{currentRow.userName ?? currentRow.username}”选择角色。
          </DialogDescription>
        </DialogHeader>

        {authRoleQuery.isLoading ? (
          <div className='py-10 text-center text-sm text-muted-foreground'>
            正在加载角色列表...
          </div>
        ) : (
          <ScrollArea className='max-h-[60vh] pe-4'>
            <div className='space-y-4'>
              <div className='grid gap-3 rounded-md border p-4 md:grid-cols-2'>
                {activeRoles.map((role) => {
                  const checked = selectedRoleIds.includes(role.roleId)
                  return (
                    <label
                      key={role.roleId}
                      className='flex items-center gap-2 text-sm'
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) => {
                          setSelectedRoleIds((prev) =>
                            next
                              ? [...prev, role.roleId]
                              : prev.filter((roleId) => roleId !== role.roleId)
                          )
                        }}
                      />
                      <span>{role.roleName}</span>
                    </label>
                  )
                })}
              </div>
              {activeRoles.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  当前没有可分配的启用角色。
                </p>
              ) : null}
              {submitError ? (
                <p className='text-sm text-destructive'>{submitError}</p>
              ) : null}
            </div>
          </ScrollArea>
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
            disabled={mutation.isPending || authRoleQuery.isLoading}
          >
            {mutation.isPending ? '保存中...' : '保存分配'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
