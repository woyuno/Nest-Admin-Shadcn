import { describe, expect, it } from 'vitest'
import { mapBackendServerOverview } from './server-contract'

describe('server-contract', () => {
  it('maps backend server overview with defaults', () => {
    expect(
      mapBackendServerOverview({
        cpu: { cpuNum: 8, used: 20, sys: 10, free: 70 },
        sys: { computerName: 'host-1', osName: 'Windows' },
        sysFiles: [{ dirName: 'C:', usage: 52 }],
      })
    ).toEqual({
      cpu: { cpuNum: 8, used: 20, sys: 10, free: 70 },
      mem: { total: 0, used: 0, free: 0, usage: 0 },
      jvm: {
        total: 0,
        used: 0,
        free: 0,
        usage: 0,
        name: '',
        version: '',
        startTime: '',
        runTime: '',
        home: '',
        inputArgs: '',
      },
      sys: {
        computerName: 'host-1',
        computerIp: '',
        osName: 'Windows',
        osArch: '',
        userDir: '',
      },
      sysFiles: [
        {
          id: 'C:-0',
          dirName: 'C:',
          sysTypeName: '',
          typeName: '',
          total: '',
          free: '',
          used: '',
          usage: 52,
        },
      ],
    })
  })
})
