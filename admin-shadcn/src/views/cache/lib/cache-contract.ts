export type BackendCacheOverview = {
  info?: Record<string, string>
  dbSize?: number
  commandStats?: Array<{ name?: string; value?: number }>
}

export type BackendCacheName = {
  cacheName?: string
  remark?: string
}

export type BackendCacheValue = {
  cacheName?: string
  cacheKey?: string
  cacheValue?: string
}

export function mapBackendCacheOverview(overview: BackendCacheOverview) {
  const info = overview.info ?? {}
  return {
    info: {
      redisVersion: info.redis_version ?? '',
      redisMode: info.redis_mode === 'standalone' ? '单机' : info.redis_mode ? '集群' : '-',
      tcpPort: info.tcp_port ?? '',
      connectedClients: info.connected_clients ?? '',
      uptimeInDays: info.uptime_in_days ?? '',
      usedMemoryHuman: info.used_memory_human ?? '',
      usedCpu: info.used_cpu_user_children ?? '',
      maxmemoryHuman: info.maxmemory_human ?? '',
      aofEnabled: info.aof_enabled === '0' ? '否' : info.aof_enabled ? '是' : '-',
      rdbStatus: info.rdb_last_bgsave_status ?? '',
      inputKbps: info.instantaneous_input_kbps ?? '',
      outputKbps: info.instantaneous_output_kbps ?? '',
    },
    dbSize: overview.dbSize ?? 0,
    commandStats: (overview.commandStats ?? []).map((item, index) => ({
      id: `${item.name ?? 'cmd'}-${index}`,
      name: item.name ?? '未知命令',
      value: item.value ?? 0,
    })),
  } as const
}

export function mapBackendCacheNames(items: BackendCacheName[]) {
  return (items ?? []).map((item, index) => ({
    id: `${item.cacheName ?? 'cache'}-${index}`,
    cacheName: item.cacheName ?? '',
    displayName: (item.cacheName ?? '').replace(':', ''),
    remark: item.remark ?? '',
  }))
}

export function mapBackendCacheKeys(cacheName: string, keys: string[]) {
  return (keys ?? []).map((item, index) => ({
    id: `${item}-${index}`,
    cacheKey: item,
    displayKey: item.replace(cacheName, ''),
  }))
}

export function buildCacheValueDefaults(detail: BackendCacheValue) {
  return {
    cacheName: detail.cacheName ?? '',
    cacheKey: detail.cacheKey ?? '',
    cacheValue: detail.cacheValue ?? '',
  }
}
