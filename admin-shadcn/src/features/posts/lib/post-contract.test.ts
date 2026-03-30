import { describe, expect, it } from 'vitest'
import {
  buildExportPostsPayload,
  buildListPostsParams,
  buildPostSavePayload,
  buildPostFormDefaults,
  mapBackendPostListItem,
} from './post-contract'

describe('post-contract', () => {
  it('builds backend list params from posts search state', () => {
    expect(
      buildListPostsParams({
        page: 2,
        pageSize: 20,
        postCode: 'ceo',
        postName: '董事长',
        status: ['active'],
      })
    ).toEqual({
      pageNum: 2,
      pageSize: 20,
      postCode: 'ceo',
      postName: '董事长',
      status: '0',
    })
  })

  it('maps backend posts into frontend table rows', () => {
    expect(
      mapBackendPostListItem({
        postId: 1,
        postCode: 'ceo',
        postName: '董事长',
        postSort: 1,
        status: '0',
        remark: '系统内置岗位',
        createTime: '2026-03-30 10:00:00',
      })
    ).toMatchObject({
      id: '1',
      postId: 1,
      postCode: 'ceo',
      postName: '董事长',
      postSort: 1,
      status: 'active',
      remark: '系统内置岗位',
    })
  })

  it('builds save payload for create and update', () => {
    expect(
      buildPostSavePayload({
        postCode: 'pm',
        postName: '项目经理',
        postSort: 3,
        status: 'inactive',
        remark: '测试备注',
      })
    ).toEqual({
      postCode: 'pm',
      postName: '项目经理',
      postSort: 3,
      status: '1',
      remark: '测试备注',
    })
  })

  it('builds default form values from backend detail', () => {
    expect(
      buildPostFormDefaults({
        postId: 2,
        postCode: 'hr',
        postName: '人力资源',
        postSort: 2,
        status: '0',
        remark: '备注',
      })
    ).toEqual({
      postId: 2,
      postCode: 'hr',
      postName: '人力资源',
      postSort: 2,
      status: 'active',
      remark: '备注',
    })
  })

  it('builds export payload without pagination fields', () => {
    expect(
      buildExportPostsPayload({
        page: 4,
        pageSize: 50,
        postCode: 'ceo',
        status: ['inactive'],
      })
    ).toEqual({
      postCode: 'ceo',
      postName: undefined,
      status: '1',
    })
  })
})
