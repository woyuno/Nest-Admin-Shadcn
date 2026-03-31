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
import { dictTypeDetailQueryKey, fetchDictTypeDetail } from '../api/dicts'
import { type DictType } from '../data/schema'
import { useDicts } from './dicts-provider'

type DictsTypeTableProps = {
  rows: DictType[]
  isLoading: boolean
  onSelect: (row: DictType) => void
}

export function DictsTypeTable({ rows, isLoading, onSelect }: DictsTypeTableProps) {
  const queryClient = useQueryClient()
  const { setCurrentTypeRow, setOpen } = useDicts()

  return (
    <div className='overflow-hidden rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>字典名称</TableHead>
            <TableHead>字典类型</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>备注</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                正在加载字典类型...
              </TableCell>
            </TableRow>
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.dictId}>
                <TableCell>
                  <button
                    type='button'
                    className='font-medium text-primary hover:underline'
                    onClick={() => onSelect(row)}
                  >
                    {row.dictName}
                  </button>
                </TableCell>
                <TableCell>{row.dictType}</TableCell>
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
                            queryKey: dictTypeDetailQueryKey(row.dictId),
                            queryFn: () => fetchDictTypeDetail(row.dictId),
                            staleTime: 60 * 1000,
                          })
                          setCurrentTypeRow(row)
                          setOpen('typeEdit')
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
                          setCurrentTypeRow(row)
                          setOpen('typeDelete')
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
              <TableCell colSpan={6} className='h-24 text-center'>
                没有查询到字典类型
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
