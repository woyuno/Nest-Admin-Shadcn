export type BackendServerOverview = {
  cpu?: {
    cpuNum?: number
    used?: number
    sys?: number
    free?: number
  }
  mem?: {
    total?: number
    used?: number
    free?: number
    usage?: number
  }
  jvm?: {
    total?: number
    used?: number
    free?: number
    usage?: number
    name?: string
    version?: string
    startTime?: string
    runTime?: string
    home?: string
    inputArgs?: string
  }
  sys?: {
    computerName?: string
    computerIp?: string
    osName?: string
    osArch?: string
    userDir?: string
  }
  sysFiles?: Array<{
    dirName?: string
    sysTypeName?: string
    typeName?: string
    total?: string
    free?: string
    used?: string
    usage?: number
  }>
}

function numberOrZero(value?: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function mapBackendServerOverview(overview: BackendServerOverview) {
  return {
    cpu: {
      cpuNum: numberOrZero(overview.cpu?.cpuNum),
      used: numberOrZero(overview.cpu?.used),
      sys: numberOrZero(overview.cpu?.sys),
      free: numberOrZero(overview.cpu?.free),
    },
    mem: {
      total: numberOrZero(overview.mem?.total),
      used: numberOrZero(overview.mem?.used),
      free: numberOrZero(overview.mem?.free),
      usage: numberOrZero(overview.mem?.usage),
    },
    jvm: {
      total: numberOrZero(overview.jvm?.total),
      used: numberOrZero(overview.jvm?.used),
      free: numberOrZero(overview.jvm?.free),
      usage: numberOrZero(overview.jvm?.usage),
      name: overview.jvm?.name ?? '',
      version: overview.jvm?.version ?? '',
      startTime: overview.jvm?.startTime ?? '',
      runTime: overview.jvm?.runTime ?? '',
      home: overview.jvm?.home ?? '',
      inputArgs: overview.jvm?.inputArgs ?? '',
    },
    sys: {
      computerName: overview.sys?.computerName ?? '',
      computerIp: overview.sys?.computerIp ?? '',
      osName: overview.sys?.osName ?? '',
      osArch: overview.sys?.osArch ?? '',
      userDir: overview.sys?.userDir ?? '',
    },
    sysFiles: (overview.sysFiles ?? []).map((item, index) => ({
      id: `${item.dirName ?? 'disk'}-${index}`,
      dirName: item.dirName ?? '',
      sysTypeName: item.sysTypeName ?? '',
      typeName: item.typeName ?? '',
      total: item.total ?? '',
      free: item.free ?? '',
      used: item.used ?? '',
      usage: numberOrZero(item.usage),
    })),
  } as const
}
