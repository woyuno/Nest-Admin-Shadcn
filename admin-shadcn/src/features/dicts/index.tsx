import { useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileDown, Plus, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Input } from '@/components/ui/input'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RefreshPageButton } from '@/components/refresh-page-button'
import { Search } from '@/components/search'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ThemeSwitch } from '@/components/theme-switch'
import { PermissionGuard } from '@/features/auth/components/permission-guard'
import { downloadBlob } from '@/lib/download-blob'
import {
  exportDictData,
  exportDictTypes,
  fetchDictData,
  fetchDictTypes,
  refreshDictCache,
} from './api/dicts'
import { DictsDataTable } from './components/dicts-data-table'
import { DictsDialogs } from './components/dicts-dialogs'
import { DictsProvider, useDicts } from './components/dicts-provider'
import { DictsTypeTable } from './components/dicts-type-table'

const route = getRouteApi('/_authenticated/system/dict/')

function DictsContent() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { setOpen } = useDicts()
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)
  const [leftFilter, setLeftFilter] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const dictTypesQuery = useQuery({
    queryKey: ['dicts', 'types', search],
    queryFn: () =>
      fetchDictTypes({
        page: search.page,
        pageSize: search.pageSize,
        dictName: search.dictName,
        dictType: search.dictType,
        status: search.typeStatus,
      }),
    placeholderData: (previousData) => previousData,
  })

  const dictTypes = dictTypesQuery.data?.list ?? []

  const selectedType = useMemo(
    () => dictTypes.find((item) => item.dictId === selectedTypeId) ?? null,
    [dictTypes, selectedTypeId]
  )

  const dictDataQuery = useQuery({
    queryKey: ['dicts', 'data', selectedType?.dictType, search],
    queryFn: () =>
      fetchDictData({
        page: search.page,
        pageSize: search.pageSize,
        dictType: selectedType?.dictType,
        dictLabel: search.dictLabel,
        status: search.dataStatus,
      }),
    enabled: !!selectedType?.dictType,
    placeholderData: (previousData) => previousData,
  })

  const visibleLeftTypes = useMemo(() => {
    const keyword = leftFilter.trim()
    if (!keyword) return dictTypes
    return dictTypes.filter(
      (item) =>
        item.dictName.includes(keyword) || item.dictType.includes(keyword)
    )
  }, [dictTypes, leftFilter])

  const handleExportTypes = async () => {
    try {
      setIsExporting(true)
      const blob = await exportDictTypes({
        page: search.page,
        pageSize: search.pageSize,
        dictName: search.dictName,
        dictType: search.dictType,
        status: search.typeStatus,
      })
      downloadBlob(blob, `字典类型-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('字典类型导出完成')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportData = async () => {
    if (!selectedType?.dictType) return
    try {
      setIsExporting(true)
      const blob = await exportDictData({
        page: search.page,
        pageSize: search.pageSize,
        dictType: selectedType.dictType,
        dictLabel: search.dictLabel,
        status: search.dataStatus,
      })
      downloadBlob(blob, `字典数据-${selectedType.dictType}-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('字典数据导出完成')
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefreshCache = async () => {
    try {
      setIsRefreshing(true)
      await refreshDictCache()
      toast.success('字典缓存已刷新')
    } finally {
      setIsRefreshing(false)
    }
  }

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
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>字典管理</h2>
        </div>

        <div className='grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]'>
          <aside className='rounded-lg border bg-card p-4'>
            <div className='mb-3 flex items-center justify-between gap-2'>
              <div>
                <h3 className='font-semibold'>字典分类</h3>
                <p className='text-xs text-muted-foreground'>点击切换右侧数据面板</p>
              </div>
              <PermissionGuard permissions={['system:dict:add']}>
                <Button size='sm' onClick={() => setOpen('typeAdd')}>
                  <Plus className='me-1 size-4' />
                  新增
                </Button>
              </PermissionGuard>
            </div>
            <Input
              value={leftFilter}
              onChange={(event) => setLeftFilter(event.target.value)}
              placeholder='按左侧分类快速筛选'
              className='mb-3'
            />
            <div className='max-h-[60vh] space-y-1 overflow-y-auto'>
              <button
                type='button'
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedTypeId === null ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setSelectedTypeId(null)}
              >
                全部字典类型
              </button>
              {visibleLeftTypes.map((item) => (
                <button
                  key={item.dictId}
                  type='button'
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedTypeId === item.dictId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setSelectedTypeId(item.dictId)}
                >
                  <div className='font-medium'>{item.dictName}</div>
                  <div className='text-xs opacity-80'>{item.dictType}</div>
                </button>
              ))}
            </div>
          </aside>

          <section className='flex min-w-0 flex-col gap-4'>
            {!selectedType ? (
              <>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                  <div className='flex flex-wrap gap-2'>
                    <Input
                      value={search.dictName ?? ''}
                      onChange={(event) =>
                        navigate({
                          search: (prev) => ({
                            ...(prev as Record<string, unknown>),
                            dictName: event.target.value || undefined,
                          }),
                        })
                      }
                      placeholder='按字典名称搜索'
                      className='h-9 w-full sm:w-56'
                    />
                    <Input
                      value={search.dictType ?? ''}
                      onChange={(event) =>
                        navigate({
                          search: (prev) => ({
                            ...(prev as Record<string, unknown>),
                            dictType: event.target.value || undefined,
                          }),
                        })
                      }
                      placeholder='按字典类型搜索'
                      className='h-9 w-full sm:w-56'
                    />
                    <Select
                      value={(search.typeStatus ?? [])[0] ?? 'all'}
                      onValueChange={(value) =>
                        navigate({
                          search: (prev) => ({
                            ...(prev as Record<string, unknown>),
                            typeStatus:
                              value === 'active' || value === 'inactive'
                                ? [value]
                                : undefined,
                          }),
                        })
                      }
                    >
                      <SelectTrigger className='w-full sm:w-44'>
                        <SelectValue placeholder='字典状态' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>全部状态</SelectItem>
                        <SelectItem value='active'>启用</SelectItem>
                        <SelectItem value='inactive'>停用</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant='outline'
                      onClick={() =>
                        navigate({
                          search: (prev) => ({
                            ...(prev as Record<string, unknown>),
                            dictName: undefined,
                            dictType: undefined,
                            typeStatus: undefined,
                          }),
                        })
                      }
                    >
                      重置
                    </Button>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    <RefreshPageButton />
                    <PermissionGuard permissions={['system:dict:add']}>
                      <Button onClick={() => setOpen('typeAdd')}>
                        <Plus className='me-1 size-4' />
                        新增字典类型
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permissions={['system:dict:export']}>
                      <Button variant='secondary' disabled={isExporting} onClick={handleExportTypes}>
                        <FileDown className='me-1 size-4' />
                        {isExporting ? '导出中' : '导出类型'}
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permissions={['system:dict:remove']}>
                      <Button variant='outline' disabled={isRefreshing} onClick={handleRefreshCache}>
                        <RefreshCcw className='me-1 size-4' />
                        {isRefreshing ? '刷新中' : '刷新缓存'}
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>

                <DictsTypeTable
                  rows={dictTypes}
                  isLoading={dictTypesQuery.isLoading}
                  onSelect={(row) => setSelectedTypeId(row.dictId)}
                />
              </>
            ) : (
              <>
                <div className='flex flex-wrap items-end justify-between gap-2 rounded-lg border bg-card p-4'>
                  <div>
                    <Button variant='ghost' size='sm' onClick={() => setSelectedTypeId(null)}>
                      <ArrowLeft className='me-1 size-4' />
                      返回类型列表
                    </Button>
                    <h3 className='mt-2 text-xl font-semibold'>{selectedType.dictName}</h3>
                    <p className='text-sm text-muted-foreground'>
                      字典类型：{selectedType.dictType}，状态：{selectedType.status === 'active' ? '启用' : '停用'}
                    </p>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    <RefreshPageButton />
                    <PermissionGuard permissions={['system:dict:add']}>
                      <Button onClick={() => setOpen('dataAdd')}>
                        <Plus className='me-1 size-4' />
                        新增字典数据
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permissions={['system:dict:export']}>
                      <Button variant='secondary' disabled={isExporting} onClick={handleExportData}>
                        <FileDown className='me-1 size-4' />
                        {isExporting ? '导出中' : '导出数据'}
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>

                <div className='flex flex-wrap gap-2'>
                  <Input
                    value={search.dictLabel ?? ''}
                    onChange={(event) =>
                      navigate({
                        search: (prev) => ({
                          ...(prev as Record<string, unknown>),
                          dictLabel: event.target.value || undefined,
                        }),
                      })
                    }
                    placeholder='按字典标签搜索'
                    className='h-9 w-full sm:w-56'
                  />
                  <Select
                    value={(search.dataStatus ?? [])[0] ?? 'all'}
                    onValueChange={(value) =>
                      navigate({
                        search: (prev) => ({
                          ...(prev as Record<string, unknown>),
                          dataStatus:
                            value === 'active' || value === 'inactive'
                              ? [value]
                              : undefined,
                        }),
                      })
                    }
                  >
                    <SelectTrigger className='w-full sm:w-44'>
                      <SelectValue placeholder='数据状态' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>全部状态</SelectItem>
                      <SelectItem value='active'>启用</SelectItem>
                      <SelectItem value='inactive'>停用</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant='outline'
                    onClick={() =>
                      navigate({
                        search: (prev) => ({
                          ...(prev as Record<string, unknown>),
                          dictLabel: undefined,
                          dataStatus: undefined,
                        }),
                      })
                    }
                  >
                    重置
                  </Button>
                </div>

                <DictsDataTable
                  rows={dictDataQuery.data?.list ?? []}
                  isLoading={dictDataQuery.isLoading}
                />
              </>
            )}
          </section>
        </div>
      </Main>

      <DictsDialogs selectedType={selectedType} />
    </>
  )
}

export function Dicts() {
  return (
    <DictsProvider>
      <DictsContent />
    </DictsProvider>
  )
}
