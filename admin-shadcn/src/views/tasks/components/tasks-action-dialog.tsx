'use client'

import { useEffect, useState } from 'react'
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
  createTask,
  fetchTaskDetail,
  tasksQueryKey,
  updateTask,
} from '../api/tasks'
import {
  concurrentPolicyOptions,
  type JobFormValues,
  jobGroupOptions,
  misfirePolicyOptions,
  taskStatusOptions,
  type TaskItem,
} from '../lib/task-contract'
import {
  buildCronExpressionFromPreset,
  weekDayOptions,
} from '../lib/cron-helper'

const formSchema = z.object({
  jobId: z.number().optional(),
  jobName: z.string().min(1, '任务名称不能为空').max(64, '任务名称最多 64 位'),
  jobGroup: z.union([z.literal('DEFAULT'), z.literal('SYSTEM')]),
  invokeTarget: z
    .string()
    .min(1, '调用目标不能为空')
    .max(500, '调用目标最多 500 位'),
  cronExpression: z.string().min(1, 'Cron 表达式不能为空'),
  misfirePolicy: z.union([z.literal('1'), z.literal('2'), z.literal('3')]),
  concurrent: z.union([z.literal('0'), z.literal('1')]),
  status: z.union([z.literal('active'), z.literal('paused')]),
  remark: z.string().max(500, '备注最多 500 字'),
})

const emptyValues: JobFormValues = {
  jobName: '',
  jobGroup: 'DEFAULT',
  invokeTarget: '',
  cronExpression: '',
  misfirePolicy: '3',
  concurrent: '1',
  status: 'active',
  remark: '',
}

type TasksActionDialogProps = {
  currentRow?: TaskItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TasksActionDialog({
  currentRow,
  open,
  onOpenChange,
}: TasksActionDialogProps) {
  const [cronMode, setCronMode] = useState<'every-n-minutes' | 'daily' | 'weekly'>(
    'every-n-minutes'
  )
  const [interval, setInterval] = useState(5)
  const [hour, setHour] = useState(8)
  const [minute, setMinute] = useState(0)
  const [weekDay, setWeekDay] = useState<(typeof weekDayOptions)[number]['value']>('MON')
  const isEdit = !!currentRow?.jobId
  const queryClient = useQueryClient()
  const form = useForm<JobFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  const detailQuery = useQuery({
    queryKey: ['tasks', 'detail', currentRow?.jobId],
    queryFn: () => fetchTaskDetail(currentRow!.jobId),
    enabled: open && isEdit,
  })

  useEffect(() => {
    if (!open) {
      form.reset(emptyValues)
      setCronMode('every-n-minutes')
      setInterval(5)
      setHour(8)
      setMinute(0)
      setWeekDay('MON')
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
    mutationFn: async (values: JobFormValues) => {
      if (values.jobId) {
        await updateTask(values)
        return
      }
      await createTask(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey })
      onOpenChange(false)
      form.reset(emptyValues)
    },
  })

  const loading = isEdit && detailQuery.isLoading

  const applyCronPreset = () => {
    const cronExpression =
      cronMode === 'every-n-minutes'
        ? buildCronExpressionFromPreset({
            type: 'every-n-minutes',
            interval,
          })
        : cronMode === 'daily'
          ? buildCronExpressionFromPreset({
              type: 'daily',
              hour,
              minute,
            })
          : buildCronExpressionFromPreset({
              type: 'weekly',
              hour,
              minute,
              weekDay,
            })

    form.setValue('cronExpression', cronExpression, { shouldValidate: true })
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
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '修改定时任务' : '新增定时任务'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? '更新任务名称、执行计划和并发策略。'
              : '创建新定时任务并设置调用目标与 Cron 表达式。'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex h-48 items-center justify-center text-muted-foreground'>
            <Loader2 className='me-2 size-4 animate-spin' />
            正在加载任务信息...
          </div>
        ) : (
          <Form {...form}>
            <form
              id='task-form'
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className='space-y-5'
            >
              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='jobName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>任务名称</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入任务名称' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='jobGroup'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>任务组</FormLabel>
                      <SelectDropdown
                        key={`task-group-${field.value}`}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择任务组'
                        className='w-full'
                        items={jobGroupOptions.map((item) => ({
                          label: item.label,
                          value: item.value,
                        }))}
                        isControlled
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='invokeTarget'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>调用目标</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例如：ryTask.ryParams('ry')"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='cronExpression'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cron 表达式</FormLabel>
                    <FormControl>
                      <div className='space-y-3'>
                        <Input placeholder='请输入 Cron 表达式' {...field} />
                        <div className='rounded-md border p-3'>
                          <div className='mb-3'>
                            <div className='text-sm font-medium'>Cron 辅助</div>
                            <p className='text-xs text-muted-foreground'>
                              用常见任务模板快速生成表达式，再按需微调。
                            </p>
                          </div>
                          <div className='grid gap-3 md:grid-cols-[160px_1fr_auto]'>
                            <SelectDropdown
                              key={`cron-mode-${cronMode}`}
                              defaultValue={cronMode}
                              onValueChange={(value) =>
                                setCronMode(
                                  value as 'every-n-minutes' | 'daily' | 'weekly'
                                )
                              }
                              placeholder='选择模板'
                              className='w-full'
                              items={[
                                { label: '每隔 N 分钟', value: 'every-n-minutes' },
                                { label: '每天固定时间', value: 'daily' },
                                { label: '每周固定时间', value: 'weekly' },
                              ]}
                              isControlled
                            />
                            {cronMode === 'every-n-minutes' ? (
                              <div className='grid gap-3 md:grid-cols-2'>
                                <Input
                                  type='number'
                                  min={1}
                                  max={59}
                                  value={interval}
                                  onChange={(event) =>
                                    setInterval(Number(event.target.value || 1))
                                  }
                                  placeholder='间隔分钟'
                                />
                                <div className='flex items-center text-sm text-muted-foreground'>
                                  例如：每 5 分钟执行一次
                                </div>
                              </div>
                            ) : cronMode === 'daily' ? (
                              <div className='grid gap-3 md:grid-cols-2'>
                                <Input
                                  type='number'
                                  min={0}
                                  max={23}
                                  value={hour}
                                  onChange={(event) =>
                                    setHour(Number(event.target.value || 0))
                                  }
                                  placeholder='小时'
                                />
                                <Input
                                  type='number'
                                  min={0}
                                  max={59}
                                  value={minute}
                                  onChange={(event) =>
                                    setMinute(Number(event.target.value || 0))
                                  }
                                  placeholder='分钟'
                                />
                              </div>
                            ) : (
                              <div className='grid gap-3 md:grid-cols-3'>
                                <SelectDropdown
                                  key={`cron-weekday-${weekDay}`}
                                  defaultValue={weekDay}
                                  onValueChange={(value) =>
                                    setWeekDay(
                                      value as (typeof weekDayOptions)[number]['value']
                                    )
                                  }
                                  placeholder='选择星期'
                                  className='w-full'
                                  items={weekDayOptions.map((item) => ({
                                    label: item.label,
                                    value: item.value,
                                  }))}
                                  isControlled
                                />
                                <Input
                                  type='number'
                                  min={0}
                                  max={23}
                                  value={hour}
                                  onChange={(event) =>
                                    setHour(Number(event.target.value || 0))
                                  }
                                  placeholder='小时'
                                />
                                <Input
                                  type='number'
                                  min={0}
                                  max={59}
                                  value={minute}
                                  onChange={(event) =>
                                    setMinute(Number(event.target.value || 0))
                                  }
                                  placeholder='分钟'
                                />
                              </div>
                            )}
                            <Button type='button' variant='outline' onClick={applyCronPreset}>
                              生成
                            </Button>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 md:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='misfirePolicy'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>执行策略</FormLabel>
                      <SelectDropdown
                        key={`task-misfire-${field.value}`}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择执行策略'
                        className='w-full'
                        items={misfirePolicyOptions.map((item) => ({
                          label: item.label,
                          value: item.value,
                        }))}
                        isControlled
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='concurrent'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>并发策略</FormLabel>
                      <SelectDropdown
                        key={`task-concurrent-${field.value}`}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择并发策略'
                        className='w-full'
                        items={concurrentPolicyOptions.map((item) => ({
                          label: item.label,
                          value: item.value,
                        }))}
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
                      <FormLabel>任务状态</FormLabel>
                      <SelectDropdown
                        key={`task-status-${field.value}`}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择任务状态'
                        className='w-full'
                        items={taskStatusOptions.map((item) => ({
                          label: item.label,
                          value: item.value,
                        }))}
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
          <Button type='submit' form='task-form' disabled={saveMutation.isPending || loading}>
            {saveMutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建任务'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
