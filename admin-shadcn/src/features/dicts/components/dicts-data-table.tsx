import { Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { ActiveStatusBadge } from '@/components/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PermissionGuard } from '@/features/auth/components/permission-guard'
import { dictDataDetailQueryKey, fetchDictDataDetail } from '../api/dicts'
import { type DictData } from '../data/schema'
import { useDicts } from './dicts-provider'

type DictsDataTableProps = {
  rows: DictData[]
  isLoading: boolean
}

function getListClassLabel(listClass: string) {
  switch (listClass) {
    case 'primary':
      return '主色'
    case 'success':
      return '成功'
    case 'info':
      return '信息'
    case 'warning':
      return '警告'
    case 'danger':
      return '危险'
    default:
      return '默认'
  }
}

export function DictsDataTable({ rows, isLoading }: DictsDataTableProps) {
  const queryClient = useQueryClient()
  const { setCurrentDataRow, setOpen } = useDicts()

  return (
    <div className='overflow-hidden rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>字典标签</TableHead>
            <TableHead>字典键值</TableHead>
            <TableHead>排序</TableHead>
            <TableHead>回显样式</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>备注</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className='h-24 text-center text-muted-foreground'>
                正在加载字典数据...
              </TableCell>
            </TableRow>
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.dictCode}>
                <TableCell>{row.dictLabel}</TableCell>
                <TableCell>{row.dictValue}</TableCell>
                <TableCell>{row.dictSort}</TableCell>
                <TableCell>{getListClassLabel(row.listClass)}</TableCell>
                <TableCell><ActiveStatusBadge status={row.status} /></TableCell>
                <TableCell>{row.remark || '-'}</TableCell>
                <TableCell>{format(row.createdAt, 'yyyy-MM-dd HH:mm')}</TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <PermissionGuard permissions={['system:dict:edit']}>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          queryClient.prefetchQuery({
                            queryKey: dictDataDetailQueryKey(row.dictCode),
                            queryFn: () => fetchDictDataDetail(row.dictCode),
                            staleTime: 60 * 1000,
                          })
                          setCurrentDataRow(row)
                          setOpen('dataEdit')
                        }}
                      >
                        <Pencil className='me-1 size-4' />
                        修改
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permissions={['system:dict:remove']}>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-red-500 hover:text-red-500'
                        onClick={() => {
                          setCurrentDataRow(row)
                          setOpen('dataDelete')
                        }}
                      >
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
              <TableCell colSpan={8} className='h-24 text-center'>
                没有查询到字典数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
