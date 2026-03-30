import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Download, Eye, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { downloadBlob } from '@/lib/download-blob'
import { handleServerError } from '@/lib/handle-server-error'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
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
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { PermissionGuard } from '@/features/auth/components/permission-guard'
import {
  deleteGenTable,
  fetchGenTables,
  genCode,
  genTablesQueryKey,
  previewGenTable,
  syncGenTable,
} from './api/gen'

const route = getRouteApi('/_authenticated/tool/gen/')

export function GenTables() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewData, setPreviewData] = useState<Record<string, string>>({})
  const [deleteRow, setDeleteRow] = useState<null | { tableId: number; tableName: string }>(null)

  const { columnFilters, onColumnFiltersChange, pagination, onPaginationChange } =
    useTableUrlState({
      search,
      navigate: navigate as NavigateFn,
      pagination: { defaultPage: 1, defaultPageSize: 10 },
      globalFilter: { enabled: false },
      columnFilters: [
        { columnId: 'tableName', searchKey: 'tableName', type: 'string' },
        { columnId: 'tableComment', searchKey: 'tableComment', type: 'string' },
      ],
    })

  const query = useQuery({
    queryKey: ['gen-tables', search],
    queryFn: () => fetchGenTables(search),
    placeholderData: (previousData) => previousData,
  })

  const deleteMutation = useMutation({
    mutationFn: async () => deleteGenTable(deleteRow!.tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: genTablesQueryKey })
      toast.success(`已删除代码生成配置 ${deleteRow?.tableName}`)
      setDeleteRow(null)
    },
    onError: handleServerError,
  })

  const previewMutation = useMutation({
    mutationFn: async (tableId: number) => previewGenTable(tableId),
    onSuccess: (data, tableId) => {
      setPreviewData(data)
      setPreviewTitle(`代码预览 #${tableId}`)
      setPreviewOpen(true)
    },
    onError: handleServerError,
  })

  const syncMutation = useMutation({
    mutationFn: syncGenTable,
    onSuccess: (_, tableName) => {
      toast.success(`已同步表 ${tableName}`)
      queryClient.invalidateQueries({ queryKey: genTablesQueryKey })
    },
    onError: handleServerError,
  })

  const rows = query.data?.list ?? []
  const total = query.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize))

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
          <h2 className='text-2xl font-bold tracking-tight'>代码生成</h2>
          <p className='text-muted-foreground'>
            已接入后端 `/tool/gen/list` 与预览、同步、删除、打包生成接口，支持按表名和描述筛选。
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>生成表列表</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <Input
                id='gen-table-name'
                name='tableName'
                placeholder='按表名搜索'
                value={(columnFilters.find((item) => item.id === 'tableName')?.value as string) ?? ''}
                onChange={(event) =>
                  onColumnFiltersChange([
                    { id: 'tableName', value: event.target.value },
                    ...(columnFilters.filter((item) => item.id !== 'tableName')),
                  ])
                }
                className='h-8 w-[220px]'
              />
              <Input
                id='gen-table-comment'
                name='tableComment'
                placeholder='按表描述搜索'
                value={(columnFilters.find((item) => item.id === 'tableComment')?.value as string) ?? ''}
                onChange={(event) =>
                  onColumnFiltersChange([
                    ...(columnFilters.filter((item) => item.id !== 'tableComment')),
                    { id: 'tableComment', value: event.target.value },
                  ])
                }
                className='h-8 w-[220px]'
              />
            </div>

            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>表名称</TableHead>
                    <TableHead>表描述</TableHead>
                    <TableHead>实体</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length ? (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.tableName}</TableCell>
                        <TableCell>{row.tableComment || '-'}</TableCell>
                        <TableCell>{row.className || '-'}</TableCell>
                        <TableCell>{format(row.createTime, 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                        <TableCell>{format(row.updateTime, 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                        <TableCell>
                          <div className='flex flex-wrap gap-1'>
                            <PermissionGuard permissions={['tool:gen:preview']}>
                              <Button variant='ghost' size='sm' onClick={() => previewMutation.mutate(row.tableId)}>
                                <Eye className='me-1 size-4' />
                                预览
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard permissions={['tool:gen:edit']}>
                              <Button variant='ghost' size='sm' onClick={() => syncMutation.mutate(row.tableName)}>
                                <RefreshCw className='me-1 size-4' />
                                同步
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard permissions={['tool:gen:code']}>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={async () => {
                                  try {
                                    const blob = await genCode(row.tableName)
                                    downloadBlob(blob, `${row.tableName}.zip`)
                                    toast.success(`已生成 ${row.tableName} 代码包`)
                                  } catch (error) {
                                    handleServerError(error)
                                  }
                                }}
                              >
                                <Download className='me-1 size-4' />
                                生成
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard permissions={['tool:gen:remove']}>
                              <Button variant='ghost' size='sm' onClick={() => setDeleteRow({ tableId: row.tableId, tableName: row.tableName })}>
                                <Trash2 className='me-1 size-4' />
                                删除
                              </Button>
                            </PermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className='h-24 text-center'>
                        没有查询到代码生成配置
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <DataTablePagination
              table={{
                getState: () => ({ pagination }),
                previousPage: () => onPaginationChange({ ...pagination, pageIndex: Math.max(0, pagination.pageIndex - 1) }),
                nextPage: () => onPaginationChange({ ...pagination, pageIndex: Math.min(pageCount - 1, pagination.pageIndex + 1) }),
                getCanPreviousPage: () => pagination.pageIndex > 0,
                getCanNextPage: () => pagination.pageIndex < pageCount - 1,
                getPageCount: () => pageCount,
                setPageIndex: (pageIndex: number) => onPaginationChange({ ...pagination, pageIndex }),
                setPageSize: (pageSize: number) => onPaginationChange({ ...pagination, pageSize, pageIndex: 0 }),
                getRowModel: () => ({ rows: rows.map((row) => ({ id: row.id })) }),
              } as never}
              className='mt-auto'
            />
          </CardContent>
        </Card>
      </Main>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className='max-w-5xl'>
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
          </DialogHeader>
          <div className='max-h-[70vh] overflow-auto rounded-md border bg-muted/30 p-4'>
            <pre className='whitespace-pre-wrap text-xs leading-6'>
              {Object.entries(previewData)
                .map(([key, value]) => `// ${key}\n${value}`)
                .join('\n\n')}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteRow}
        onOpenChange={(open) => {
          if (!open) setDeleteRow(null)
        }}
        handleConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        destructive
        title='删除代码生成配置'
        desc={`确定删除表 ${deleteRow?.tableName || ''} 的生成配置吗？`}
        confirmText='确认删除'
      />
    </>
  )
}
