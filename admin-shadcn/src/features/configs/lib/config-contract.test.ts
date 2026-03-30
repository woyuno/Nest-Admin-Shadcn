import { describe, expect, it } from 'vitest'
import {
  buildConfigFormDefaults,
  buildConfigSavePayload,
  buildExportConfigsPayload,
  buildListConfigsParams,
  mapBackendConfigListItem,
} from './config-contract'

describe('config-contract', () => {
  it('builds backend list params from configs search state', () => {
    expect(
      buildListConfigsParams({
        page: 2,
        pageSize: 20,
        configName: '主框架页',
        configKey: 'sys.index.skinName',
        configType: ['builtIn'],
      })
    ).toEqual({
      pageNum: 2,
      pageSize: 20,
      configName: '主框架页',
      configKey: 'sys.index.skinName',
      configType: 'Y',
    })
  })

  it('maps backend configs into frontend table rows', () => {
    expect(
      mapBackendConfigListItem({
        configId: 1,
        configName: '主框架页-默认皮肤样式名称',
        configKey: 'sys.index.skinName',
        configValue: 'skin-blue',
        configType: 'Y',
        remark: '蓝色 skin-blue、绿色 skin-green、紫色 skin-purple、红色 skin-red、黄色 skin-yellow',
        createTime: '2025-02-28 16:52:10',
      })
    ).toMatchObject({
      id: '1',
      configId: 1,
      configKey: 'sys.index.skinName',
      configType: 'builtIn',
    })
  })

  it('builds save payload for create and update', () => {
    expect(
      buildConfigSavePayload({
        configName: '演示参数',
        configKey: 'demo.key',
        configValue: 'demo-value',
        configType: 'custom',
        remark: '演示备注',
      })
    ).toEqual({
      configId: undefined,
      configName: '演示参数',
      configKey: 'demo.key',
      configValue: 'demo-value',
      configType: 'N',
      remark: '演示备注',
    })
  })

  it('builds default form values from backend detail', () => {
    expect(
      buildConfigFormDefaults({
        configId: 2,
        configName: '账号自助-验证码开关',
        configKey: 'sys.account.captchaEnabled',
        configValue: 'true',
        configType: 'Y',
        remark: '是否开启验证码',
      })
    ).toEqual({
      configId: 2,
      configName: '账号自助-验证码开关',
      configKey: 'sys.account.captchaEnabled',
      configValue: 'true',
      configType: 'builtIn',
      remark: '是否开启验证码',
    })
  })

  it('builds export payload without pagination fields', () => {
    expect(
      buildExportConfigsPayload({
        page: 3,
        pageSize: 10,
        configKey: 'sys.account.captchaEnabled',
        configType: ['custom'],
      })
    ).toEqual({
      configName: undefined,
      configKey: 'sys.account.captchaEnabled',
      configType: 'N',
    })
  })
})
