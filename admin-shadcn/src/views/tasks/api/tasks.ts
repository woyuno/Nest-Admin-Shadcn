import { request } from '@/lib/request'
import {
  buildJobFormDefaults,
  buildJobLogExportPayload,
  buildJobLogListParams,
  buildJobSavePayload,
  buildListJobsParams,
  buildListTasksExportPayload,
  mapBackendJobItem,
  mapBackendJobLogItem,
  type BackendJobItem,
  type BackendJobLogItem,
  type JobFormValues,
  type TaskLogsSearch,
  type TasksSearch,
} from '../lib/task-contract'

type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T
}

type BackendListResponse<T> = {
  list: T[]
  total: number
}

export const tasksQueryKey = ['tasks'] as const
export const taskLogsQueryKey = ['task-logs'] as const

export async function fetchTasks(search: TasksSearch) {
  const response = await request.get<ApiEnvelope<BackendListResponse<BackendJobItem>>>(
    '/monitor/job/list',
    { params: buildListJobsParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendJobItem),
    total: response.data.data.total || 0,
  }
}

export async function fetchTaskDetail(jobId: number) {
  const response = await request.get<ApiEnvelope<BackendJobItem>>(
    `/monitor/job/${jobId}`
  )

  return buildJobFormDefaults(response.data.data)
}

export async function createTask(values: JobFormValues) {
  await request.post<ApiEnvelope<unknown>>('/monitor/job', buildJobSavePayload(values))
}

export async function updateTask(values: JobFormValues) {
  await request.put<ApiEnvelope<unknown>>('/monitor/job', buildJobSavePayload(values))
}

export async function deleteTasks(ids: Array<number | string>) {
  await request.delete<ApiEnvelope<unknown>>(`/monitor/job/${ids.join(',')}`)
}

export async function changeTaskStatus(input: { jobId: number; enabled: boolean }) {
  await request.put<ApiEnvelope<unknown>>('/monitor/job/changeStatus', {
    jobId: input.jobId,
    status: input.enabled ? '0' : '1',
  })
}

export async function runTask(jobId: number) {
  await request.put<ApiEnvelope<unknown>>('/monitor/job/run', { jobId })
}

export async function exportTasks(search: TasksSearch) {
  const response = await request.post<Blob>(
    '/monitor/job/export',
    buildListTasksExportPayload(search),
    {
      responseType: 'blob',
    }
  )

  return response.data
}

export async function fetchTaskLogs(search: TaskLogsSearch) {
  const response = await request.get<ApiEnvelope<BackendListResponse<BackendJobLogItem>>>(
    '/monitor/jobLog/list',
    { params: buildJobLogListParams(search) }
  )

  return {
    list: (response.data.data.list || []).map(mapBackendJobLogItem),
    total: response.data.data.total || 0,
  }
}

export async function cleanTaskLogs() {
  await request.delete<ApiEnvelope<unknown>>('/monitor/jobLog/clean')
}

export async function exportTaskLogs(search: TaskLogsSearch) {
  const response = await request.post<Blob>(
    '/monitor/jobLog/export',
    buildJobLogExportPayload(search),
    {
      responseType: 'blob',
    }
  )

  return response.data
}
