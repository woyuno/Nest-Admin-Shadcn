import { describe, expect, it } from 'vitest'
import {
  buildListNoticesParams,
  buildNoticeFormDefaults,
  buildNoticeSavePayload,
  mapBackendNoticeListItem,
} from './notice-contract'

describe('notice-contract', () => {
  it('builds backend list params from notices search state', () => {
    expect(
      buildListNoticesParams({
        page: 2,
        pageSize: 20,
        noticeTitle: '维护通知',
        createBy: 'admin',
        noticeType: ['notice'],
      })
    ).toEqual({
      pageNum: 2,
      pageSize: 20,
      noticeTitle: '维护通知',
      createBy: 'admin',
      noticeType: '1',
    })
  })

  it('maps backend notices into frontend table rows', () => {
    expect(
      mapBackendNoticeListItem({
        noticeId: 1,
        noticeTitle: '温馨提醒：2018-07-01 nest-admin新版本发布啦',
        noticeType: '2',
        status: '0',
        createBy: 'admin',
        noticeContent: '<p>公告内容</p>',
        createTime: '2025-02-28 16:52:10',
      })
    ).toMatchObject({
      id: '1',
      noticeId: 1,
      noticeType: 'announcement',
      status: 'published',
      createBy: 'admin',
    })
  })

  it('builds save payload for create and update', () => {
    expect(
      buildNoticeSavePayload({
        noticeTitle: '维护通知',
        noticeType: 'notice',
        status: 'draft',
        noticeContent: '今晚维护',
      })
    ).toEqual({
      noticeId: undefined,
      noticeTitle: '维护通知',
      noticeType: '1',
      status: '1',
      noticeContent: '今晚维护',
    })
  })

  it('builds default form values from backend detail', () => {
    expect(
      buildNoticeFormDefaults({
        noticeId: 2,
        noticeTitle: '公告标题',
        noticeType: '2',
        status: '0',
        noticeContent: '<p>内容</p>',
      })
    ).toEqual({
      noticeId: 2,
      noticeTitle: '公告标题',
      noticeType: 'announcement',
      status: 'published',
      noticeContent: '<p>内容</p>',
    })
  })
})
