import { describe, expect, it } from 'vitest'
import {
  buildUserSavePayload,
  buildUserFormDefaults,
  flattenDeptOptions,
} from './user-form-contract'

describe('user-form-contract', () => {
  it('builds add payload from form values', () => {
    expect(
      buildUserSavePayload({
        userName: 'alice',
        nickName: '爱丽丝',
        password: 'abc12345',
        confirmPassword: 'abc12345',
        deptId: '100',
        phonenumber: '13800138000',
        email: 'alice@example.com',
        sex: '1',
        status: '0',
        postIds: ['10', '11'],
        roleIds: ['2'],
        remark: '测试用户',
      })
    ).toEqual({
      userName: 'alice',
      nickName: '爱丽丝',
      password: 'abc12345',
      deptId: 100,
      phonenumber: '13800138000',
      email: 'alice@example.com',
      sex: '1',
      status: '0',
      postIds: [10, 11],
      roleIds: [2],
      remark: '测试用户',
    })
  })

  it('builds edit payload without confirmPassword', () => {
    expect(
      buildUserSavePayload({
        userId: 12,
        userName: 'alice',
        nickName: '爱丽丝',
        password: '',
        confirmPassword: '',
        deptId: '100',
        phonenumber: '13800138000',
        email: 'alice@example.com',
        sex: '1',
        status: '0',
        postIds: ['10'],
        roleIds: ['2'],
        remark: '',
      })
    ).toEqual({
      userId: 12,
      userName: 'alice',
      nickName: '爱丽丝',
      deptId: 100,
      phonenumber: '13800138000',
      email: 'alice@example.com',
      sex: '1',
      status: '0',
      postIds: [10],
      roleIds: [2],
      remark: '',
    })
  })

  it('maps detail payload into form defaults', () => {
    expect(
      buildUserFormDefaults({
        data: {
          userId: 12,
          userName: 'alice',
          nickName: '爱丽丝',
          deptId: 100,
          phonenumber: '13800138000',
          email: 'alice@example.com',
          sex: '1',
          status: '0',
          remark: '备注',
        },
        postIds: [10],
        roleIds: [2],
      })
    ).toEqual({
      userId: 12,
      userName: 'alice',
      nickName: '爱丽丝',
      password: '',
      confirmPassword: '',
      deptId: '100',
      phonenumber: '13800138000',
      email: 'alice@example.com',
      sex: '1',
      status: '0',
      postIds: ['10'],
      roleIds: ['2'],
      remark: '备注',
    })
  })

  it('flattens dept tree for select usage', () => {
    expect(
      flattenDeptOptions([
        {
          id: 100,
          label: '研发中心',
          children: [{ id: 101, label: '前端组' }],
        },
      ])
    ).toEqual([
      { label: '研发中心', value: '100' },
      { label: '研发中心 / 前端组', value: '101' },
    ])
  })
})
