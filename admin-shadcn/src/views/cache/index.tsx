import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Database, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import { clearCacheAll, fetchCacheOverview } from './api/cache'

export function CacheMonitor() {
  const queryClient = useQueryClient()
  const [clearOpen, setClearOpen] = useState(false)
  const cacheQuery = useQuery({
    queryKey: ['cache-overview'],
    queryFn: fetchCacheOverview,
  })

  const clearMutation = useMutation({
    mutationFn: clearCacheAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cache-overview'] })
      toast.success('全部缓存已清理')
      setClearOpen(false)
    },
    onError: handleServerError,
  })

  const data = cacheQuery.data

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>缓存监控</h2>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => cacheQuery.refetch()}>
              <RefreshCw className='me-2 size-4' />
              刷新
            </Button>
            <PermissionGuard permissions={['monitor:cache:remove']}>
              <Button variant='destructive' onClick={() => setClearOpen(true)}>
                <Trash2 className='me-2 size-4' />
                清理全部
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <Card><CardHeader className='pb-2'><CardTitle className='text-sm'>Redis 版本</CardTitle></CardHeader><CardContent className='text-2xl font-semibold'>{data?.info.redisVersion || '-'}</CardContent></Card>
          <Card><CardHeader className='pb-2'><CardTitle className='text-sm'>运行模式</CardTitle></CardHeader><CardContent className='text-2xl font-semibold'>{data?.info.redisMode || '-'}</CardContent></Card>
          <Card><CardHeader className='pb-2'><CardTitle className='text-sm'>客户端数</CardTitle></CardHeader><CardContent className='text-2xl font-semibold'>{data?.info.connectedClients || '-'}</CardContent></Card>
          <Card><CardHeader className='pb-2'><CardTitle className='text-sm'>Key 数量</CardTitle></CardHeader><CardContent className='text-2xl font-semibold'>{data?.dbSize ?? 0}</CardContent></Card>
        </div>

        <div className='grid gap-4 xl:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Database className='size-4' />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className='grid gap-3 sm:grid-cols-2'>
              {[
                ['端口', data?.info.tcpPort || '-'],
                ['运行天数', data?.info.uptimeInDays || '-'],
                ['使用内存', data?.info.usedMemoryHuman || '-'],
                ['内存配置', data?.info.maxmemoryHuman || '-'],
                ['AOF 开启', data?.info.aofEnabled || '-'],
                ['RDB 状态', data?.info.rdbStatus || '-'],
                ['网络入口', `${data?.info.inputKbps || '-'} kps`],
                ['网络出口', `${data?.info.outputKbps || '-'} kps`],
              ].map(([label, value]) => (
                <div key={label} className='rounded-lg border p-4'>
                  <div className='text-xs text-muted-foreground'>{label}</div>
                  <div className='mt-1 font-medium'>{value}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>命令统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-hidden rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>命令</TableHead>
                      <TableHead>调用次数</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.commandStats.length ? (
                      data.commandStats.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.value}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className='h-24 text-center'>
                          没有命令统计数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        handleConfirm={() => clearMutation.mutate()}
        isLoading={clearMutation.isPending}
        destructive
        title='清理全部缓存'
        desc='确定清理全部 Redis 缓存吗？该操作会影响当前在线业务。'
        confirmText='确认清理'
      />
    </>
  )
}

