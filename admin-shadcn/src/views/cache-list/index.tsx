import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eraser, RefreshCw, Trash2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import {
  clearCacheAll,
  clearCacheKey,
  clearCacheName,
  fetchCacheKeys,
  fetchCacheNames,
  fetchCacheValue,
} from '@/views/cache/api/cache'

export function CacheList() {
  const queryClient = useQueryClient()
  const [selectedName, setSelectedName] = useState('')
  const [selectedKey, setSelectedKey] = useState('')
  const [dialog, setDialog] = useState<null | 'name' | 'key' | 'all'>(null)

  const namesQuery = useQuery({
    queryKey: ['cache-names'],
    queryFn: fetchCacheNames,
  })

  const keysQuery = useQuery({
    queryKey: ['cache-keys', selectedName],
    queryFn: () => fetchCacheKeys(selectedName),
    enabled: !!selectedName,
  })

  const valueQuery = useQuery({
    queryKey: ['cache-value', selectedName, selectedKey],
    queryFn: () => fetchCacheValue(selectedName, selectedKey),
    enabled: !!selectedName && !!selectedKey,
  })

  useEffect(() => {
    if (!selectedName && namesQuery.data?.length) {
      setSelectedName(namesQuery.data[0].cacheName)
    }
  }, [namesQuery.data, selectedName])

  useEffect(() => {
    if (selectedName) {
      setSelectedKey('')
    }
  }, [selectedName])

  const clearNameMutation = useMutation({
    mutationFn: async () => clearCacheName(selectedName),
    onSuccess: () => {
      toast.success(`缓存名称 ${selectedName} 已清理`)
      queryClient.invalidateQueries({ queryKey: ['cache-names'] })
      queryClient.invalidateQueries({ queryKey: ['cache-keys'] })
      setDialog(null)
    },
    onError: handleServerError,
  })

  const clearKeyMutation = useMutation({
    mutationFn: async () => clearCacheKey(selectedKey),
    onSuccess: () => {
      toast.success(`缓存键 ${selectedKey} 已清理`)
      queryClient.invalidateQueries({ queryKey: ['cache-keys'] })
      queryClient.invalidateQueries({ queryKey: ['cache-value'] })
      setSelectedKey('')
      setDialog(null)
    },
    onError: handleServerError,
  })

  const clearAllMutation = useMutation({
    mutationFn: clearCacheAll,
    onSuccess: () => {
      toast.success('全部缓存已清理')
      queryClient.invalidateQueries({ queryKey: ['cache-names'] })
      queryClient.invalidateQueries({ queryKey: ['cache-keys'] })
      queryClient.invalidateQueries({ queryKey: ['cache-value'] })
      setSelectedKey('')
      setDialog(null)
    },
    onError: handleServerError,
  })

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
            <h2 className='text-2xl font-bold tracking-tight'>缓存列表</h2>
          </div>
          <Button variant='outline' onClick={() => namesQuery.refetch()}>
            <RefreshCw className='me-2 size-4' />
            刷新缓存名称
          </Button>
        </div>

        <div className='grid gap-4 xl:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>缓存名称</CardTitle>
              <PermissionGuard permissions={['monitor:cache:remove']}>
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={!selectedName}
                  onClick={() => setDialog('name')}
                >
                  <Trash2 className='me-1 size-4' />
                  清理名称
                </Button>
              </PermissionGuard>
            </CardHeader>
            <CardContent className='max-h-[520px] overflow-auto p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>缓存名称</TableHead>
                    <TableHead>备注</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {namesQuery.data?.length ? (
                    namesQuery.data.map((item) => (
                      <TableRow
                        key={item.id}
                        data-state={selectedName === item.cacheName ? 'selected' : undefined}
                        className='cursor-pointer'
                        onClick={() => setSelectedName(item.cacheName)}
                      >
                        <TableCell>{item.displayName}</TableCell>
                        <TableCell>{item.remark || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className='h-24 text-center'>
                        没有缓存名称
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>键名列表</CardTitle>
              <div className='flex gap-2'>
                <Button variant='ghost' size='sm' disabled={!selectedName} onClick={() => keysQuery.refetch()}>
                  <RefreshCw className='me-1 size-4' />
                  刷新
                </Button>
                <PermissionGuard permissions={['monitor:cache:remove']}>
                  <Button
                    variant='ghost'
                    size='sm'
                    disabled={!selectedKey}
                    onClick={() => setDialog('key')}
                  >
                    <Trash2 className='me-1 size-4' />
                    清理键
                  </Button>
                </PermissionGuard>
              </div>
            </CardHeader>
            <CardContent className='max-h-[520px] overflow-auto p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>键名</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keysQuery.data?.length ? (
                    keysQuery.data.map((item) => (
                      <TableRow
                        key={item.id}
                        data-state={selectedKey === item.cacheKey ? 'selected' : undefined}
                        className='cursor-pointer'
                        onClick={() => setSelectedKey(item.cacheKey)}
                      >
                        <TableCell>{item.displayKey || item.cacheKey}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className='h-24 text-center'>没有缓存键名</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>缓存内容</CardTitle>
              <PermissionGuard permissions={['monitor:cache:remove']}>
                <Button variant='destructive' size='sm' onClick={() => setDialog('all')}>
                  <Eraser className='me-1 size-4' />
                  清理全部
                </Button>
              </PermissionGuard>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <div className='mb-1 text-xs text-muted-foreground'>缓存名称</div>
                <div className='rounded-md border px-3 py-2 text-sm'>{valueQuery.data?.cacheName || selectedName || '-'}</div>
              </div>
              <div>
                <div className='mb-1 text-xs text-muted-foreground'>缓存键名</div>
                <div className='rounded-md border px-3 py-2 text-sm break-all'>{valueQuery.data?.cacheKey || selectedKey || '-'}</div>
              </div>
              <div>
                <div className='mb-1 text-xs text-muted-foreground'>缓存内容</div>
                <Textarea readOnly value={valueQuery.data?.cacheValue || ''} className='min-h-[320px]' />
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>

      <ConfirmDialog
        open={dialog === 'name'}
        onOpenChange={(open) => setDialog(open ? 'name' : null)}
        handleConfirm={() => clearNameMutation.mutate()}
        isLoading={clearNameMutation.isPending}
        destructive
        title='清理缓存名称'
        desc={`确定清理缓存名称“${selectedName}”吗？`}
        confirmText='确认清理'
      />
      <ConfirmDialog
        open={dialog === 'key'}
        onOpenChange={(open) => setDialog(open ? 'key' : null)}
        handleConfirm={() => clearKeyMutation.mutate()}
        isLoading={clearKeyMutation.isPending}
        destructive
        title='清理缓存键名'
        desc={`确定清理缓存键“${selectedKey}”吗？`}
        confirmText='确认清理'
      />
      <ConfirmDialog
        open={dialog === 'all'}
        onOpenChange={(open) => setDialog(open ? 'all' : null)}
        handleConfirm={() => clearAllMutation.mutate()}
        isLoading={clearAllMutation.isPending}
        destructive
        title='清理全部缓存'
        desc='确定清理全部缓存吗？该操作会影响当前在线业务。'
        confirmText='确认清理'
      />
    </>
  )
}

