export type TaskStatus = 'active' | 'paused'
export type TaskLogStatus = 'success' | 'error'
export type JobGroup = 'DEFAULT' | 'SYSTEM'
export type MisfirePolicy = '1' | '2' | '3'
export type ConcurrentPolicy = '0' | '1'

export type TasksSearch = {
  page?: number
  pageSize?: number
  jobName?: string
  jobGroup?: JobGroup[]
  status?: TaskStatus[]
}

export type TaskLogsSearch = {
  page?: number
  pageSize?: number
  jobName?: string
  jobGroup?: JobGroup[]
  status?: TaskLogStatus[]
}

export type BackendJobItem = {
  jobId: number
  jobName?: string
  jobGroup?: string
  invokeTarget?: string
  cronExpression?: string
  misfirePolicy?: string
  concurrent?: string
  status?: '0' | '1'
  remark?: string
  createTime?: string | Date
  updateTime?: string | Date
}

export type BackendJobLogItem = {
  jobLogId: number
  jobName?: string
  jobGroup?: string
  invokeTarget?: string
  jobMessage?: string
  status?: '0' | '1'
  exceptionInfo?: string
  createTime?: string | Date
}

export type JobFormValues = {
  jobId?: number
  jobName: string
  jobGroup: JobGroup
  invokeTarget: string
  cronExpression: string
  misfirePolicy: MisfirePolicy
  concurrent: ConcurrentPolicy
  status: TaskStatus
  remark: string
}

export type TaskItem = ReturnType<typeof mapBackendJobItem>
export type TaskLogItem = ReturnType<typeof mapBackendJobLogItem>

export const jobGroupOptions = [
  { label: '默认', value: 'DEFAULT' },
  { label: '系统', value: 'SYSTEM' },
] as const

export const taskStatusOptions = [
  { label: '正常', value: 'active' },
  { label: '暂停', value: 'paused' },
] as const

export const taskLogStatusOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'error' },
] as const

export const misfirePolicyOptions = [
  { label: '立即执行', value: '1' },
  { label: '执行一次', value: '2' },
  { label: '放弃执行', value: '3' },
] as const

export const concurrentPolicyOptions = [
  { label: '允许并发', value: '0' },
  { label: '禁止并发', value: '1' },
] as const

function normalizeDate(value?: string | Date) {
  if (!value) return new Date(0)
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function normalizeString(value?: string) {
  return value?.trim() || ''
}

function mapJobStatusToBackend(
  status?: TaskStatus[] | TaskStatus
): '0' | '1' | undefined {
  const nextStatus = Array.isArray(status) ? status[0] : status
  return nextStatus === 'active'
    ? '0'
    : nextStatus === 'paused'
      ? '1'
      : undefined
}

function mapJobLogStatusToBackend(
  status?: TaskLogStatus[] | TaskLogStatus
): '0' | '1' | undefined {
  const nextStatus = Array.isArray(status) ? status[0] : status
  return nextStatus === 'success'
    ? '0'
    : nextStatus === 'error'
      ? '1'
      : undefined
}

function mapJobGroupToBackend(
  jobGroup?: JobGroup[] | JobGroup
): JobGroup | undefined {
  const nextGroup = Array.isArray(jobGroup) ? jobGroup[0] : jobGroup
  return nextGroup === 'DEFAULT' || nextGroup === 'SYSTEM'
    ? nextGroup
    : undefined
}

export function getJobGroupLabel(value?: string) {
  return jobGroupOptions.find((item) => item.value === value)?.label ?? '未知'
}

export function getJobStatusLabel(value?: TaskStatus) {
  return taskStatusOptions.find((item) => item.value === value)?.label ?? '未知'
}

export function getTaskLogStatusLabel(value?: TaskLogStatus) {
  return taskLogStatusOptions.find((item) => item.value === value)?.label ?? '未知'
}

export function buildListJobsParams(search: TasksSearch) {
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    jobName: normalizeString(search.jobName) || undefined,
    jobGroup: mapJobGroupToBackend(search.jobGroup),
    status: mapJobStatusToBackend(search.status),
  }
}

export function buildListTasksExportPayload(search: TasksSearch) {
  const { pageNum: _pageNum, pageSize: _pageSize, ...rest } =
    buildListJobsParams(search)

  return rest
}

export function mapBackendJobItem(item: BackendJobItem) {
  return {
    id: String(item.jobId),
    jobId: item.jobId,
    jobName: item.jobName ?? '',
    jobGroup: mapJobGroupToBackend(item.jobGroup as JobGroup) ?? 'DEFAULT',
    invokeTarget: item.invokeTarget ?? '',
    cronExpression: item.cronExpression ?? '',
    misfirePolicy: (item.misfirePolicy as MisfirePolicy) ?? '3',
    concurrent: (item.concurrent as ConcurrentPolicy) ?? '1',
    status: item.status === '1' ? ('paused' as const) : ('active' as const),
    remark: item.remark ?? '',
    createTime: normalizeDate(item.createTime),
    updateTime: normalizeDate(item.updateTime ?? item.createTime),
  }
}

export function buildJobFormDefaults(detail: Partial<BackendJobItem>): JobFormValues {
  return {
    jobId: detail.jobId,
    jobName: normalizeString(detail.jobName),
    jobGroup: mapJobGroupToBackend(detail.jobGroup as JobGroup) ?? 'DEFAULT',
    invokeTarget: normalizeString(detail.invokeTarget),
    cronExpression: normalizeString(detail.cronExpression),
    misfirePolicy: (detail.misfirePolicy as MisfirePolicy) ?? '3',
    concurrent: (detail.concurrent as ConcurrentPolicy) ?? '1',
    status: detail.status === '1' ? 'paused' : 'active',
    remark: normalizeString(detail.remark),
  }
}

export function buildJobSavePayload(values: JobFormValues) {
  return {
    jobId: values.jobId,
    jobName: normalizeString(values.jobName),
    jobGroup: values.jobGroup,
    invokeTarget: normalizeString(values.invokeTarget),
    cronExpression: normalizeString(values.cronExpression),
    misfirePolicy: values.misfirePolicy,
    concurrent: values.concurrent,
    status: mapJobStatusToBackend(values.status) ?? '0',
    remark: normalizeString(values.remark) || undefined,
  }
}

export function buildJobLogListParams(search: TaskLogsSearch) {
  return {
    pageNum: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    jobName: normalizeString(search.jobName) || undefined,
    jobGroup: mapJobGroupToBackend(search.jobGroup),
    status: mapJobLogStatusToBackend(search.status),
  }
}

export function buildJobLogExportPayload(search: TaskLogsSearch) {
  const { pageNum: _pageNum, pageSize: _pageSize, ...rest } =
    buildJobLogListParams(search)

  return rest
}

export function mapBackendJobLogItem(item: BackendJobLogItem) {
  return {
    id: String(item.jobLogId),
    jobLogId: item.jobLogId,
    jobName: item.jobName ?? '',
    jobGroup: mapJobGroupToBackend(item.jobGroup as JobGroup) ?? 'DEFAULT',
    invokeTarget: item.invokeTarget ?? '',
    jobMessage: item.jobMessage ?? '',
    status: item.status === '1' ? ('error' as const) : ('success' as const),
    exceptionInfo: item.exceptionInfo ?? '',
    createTime: normalizeDate(item.createTime),
  }
}
