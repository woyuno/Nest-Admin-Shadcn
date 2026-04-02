import { describe, expect, it } from 'vitest'
import {
  buildJobFormDefaults,
  buildJobLogExportPayload,
  buildJobLogListParams,
  buildJobSavePayload,
  buildListJobsParams,
  buildListTasksExportPayload,
  getJobGroupLabel,
  getJobStatusLabel,
  mapBackendJobItem,
  mapBackendJobLogItem,
} from './task-contract'

describe('task-contract', () => {
  it('builds timed job list params', () => {
    expect(
      buildListJobsParams({
        page: 2,
        pageSize: 20,
        jobName: ' 同步缓存 ',
        jobGroup: ['DEFAULT'],
        status: ['active'],
      })
    ).toEqual({
      pageNum: 2,
      pageSize: 20,
      jobName: '同步缓存',
      jobGroup: 'DEFAULT',
      status: '0',
    })
  })

  it('builds timed job export payload', () => {
    expect(
      buildListTasksExportPayload({
        jobName: ' 清理日志 ',
        jobGroup: ['SYSTEM'],
        status: ['paused'],
      })
    ).toEqual({
      jobName: '清理日志',
      jobGroup: 'SYSTEM',
      status: '1',
    })
  })

  it('maps backend timed job item', () => {
    expect(
      mapBackendJobItem({
        jobId: 3,
        jobName: '数据同步',
        jobGroup: 'SYSTEM',
        invokeTarget: 'syncTask.run()',
        cronExpression: '0 0/5 * * * ?',
        misfirePolicy: '2',
        concurrent: '1',
        status: '0',
        createTime: '2026-03-30 10:00:00',
        updateTime: '2026-03-30 11:00:00',
      })
    ).toMatchObject({
      id: '3',
      jobId: 3,
      jobName: '数据同步',
      jobGroup: 'SYSTEM',
      invokeTarget: 'syncTask.run()',
      cronExpression: '0 0/5 * * * ?',
      misfirePolicy: '2',
      concurrent: '1',
      status: 'active',
    })
  })

  it('builds job form defaults and save payload', () => {
    const defaults = buildJobFormDefaults({
      jobId: 8,
      jobName: ' 归档任务 ',
      jobGroup: 'DEFAULT',
      invokeTarget: 'archiveTask.run()',
      cronExpression: '0 0 1 * * ?',
      misfirePolicy: '1',
      concurrent: '0',
      status: '1',
      remark: ' 每天归档 ',
    })

    expect(defaults).toEqual({
      jobId: 8,
      jobName: '归档任务',
      jobGroup: 'DEFAULT',
      invokeTarget: 'archiveTask.run()',
      cronExpression: '0 0 1 * * ?',
      misfirePolicy: '1',
      concurrent: '0',
      status: 'paused',
      remark: '每天归档',
    })

    expect(buildJobSavePayload(defaults)).toEqual({
      jobId: 8,
      jobName: '归档任务',
      jobGroup: 'DEFAULT',
      invokeTarget: 'archiveTask.run()',
      cronExpression: '0 0 1 * * ?',
      misfirePolicy: '1',
      concurrent: '0',
      status: '1',
      remark: '每天归档',
    })
  })

  it('builds job log query payload and maps log item', () => {
    expect(
      buildJobLogListParams({
        page: 3,
        pageSize: 15,
        jobName: ' 数据同步 ',
        jobGroup: ['SYSTEM'],
        status: ['error'],
      })
    ).toEqual({
      pageNum: 3,
      pageSize: 15,
      jobName: '数据同步',
      jobGroup: 'SYSTEM',
      status: '1',
    })

    expect(
      buildJobLogExportPayload({
        jobName: ' 数据同步 ',
        jobGroup: ['SYSTEM'],
        status: ['success'],
      })
    ).toEqual({
      jobName: '数据同步',
      jobGroup: 'SYSTEM',
      status: '0',
    })

    expect(
      mapBackendJobLogItem({
        jobLogId: 11,
        jobName: '数据同步',
        jobGroup: 'SYSTEM',
        invokeTarget: 'syncTask.run()',
        jobMessage: '执行成功',
        status: '0',
        exceptionInfo: '',
        createTime: '2026-03-30 12:00:00',
      })
    ).toMatchObject({
      id: '11',
      jobLogId: 11,
      jobName: '数据同步',
      jobGroup: 'SYSTEM',
      status: 'success',
      jobMessage: '执行成功',
    })
  })

  it('exposes labels for job groups and statuses', () => {
    expect(getJobGroupLabel('DEFAULT')).toBe('默认')
    expect(getJobGroupLabel('SYSTEM')).toBe('系统')
    expect(getJobStatusLabel('active')).toBe('正常')
    expect(getJobStatusLabel('paused')).toBe('暂停')
  })
})
