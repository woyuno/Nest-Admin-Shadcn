import { ChevronDown, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type Dept } from '../data/schema'
import { DeptRowActions } from './dept-row-actions'

type VisibleDeptRow = Dept & {
  depth: number
  hasChildren: boolean
}

type DeptsTableProps = {
  rows: VisibleDeptRow[]
  isLoading: boolean
  expandedIds: Set<number>
  onToggleExpand: (deptId: number) => void
}

export function DeptsTable({
  rows,
  isLoading,
  expandedIds,
  onToggleExpand,
}: DeptsTableProps) {
  return (
    <div className='overflow-hidden rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[320px]'>部门名称</TableHead>
            <TableHead className='w-[120px]'>排序</TableHead>
            <TableHead className='w-[100px]'>状态</TableHead>
            <TableHead className='w-[120px]'>负责人</TableHead>
            <TableHead className='w-[140px]'>联系电话</TableHead>
            <TableHead className='w-[220px]'>邮箱</TableHead>
            <TableHead className='w-[180px]'>创建时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className='h-24 text-center text-muted-foreground'>
                正在加载部门数据...
              </TableCell>
            </TableRow>
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.deptId}>
                <TableCell>
                  <div
                    className='flex items-center gap-2'
                    style={{ paddingLeft: `${row.depth * 20}px` }}
                  >
                    {row.hasChildren ? (
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-7'
                        onClick={() => onToggleExpand(row.deptId)}
                      >
                        {expandedIds.has(row.deptId) ? (
                          <ChevronDown className='size-4' />
                        ) : (
                          <ChevronRight className='size-4' />
                        )}
                      </Button>
                    ) : (
                      <span className='inline-block size-7' />
                    )}
                    <span>{row.deptName}</span>
                  </div>
                </TableCell>
                <TableCell>{row.orderNum}</TableCell>
                <TableCell>{row.status === 'active' ? '启用' : '停用'}</TableCell>
                <TableCell>{row.leader || '-'}</TableCell>
                <TableCell>{row.phone || '-'}</TableCell>
                <TableCell>{row.email || '-'}</TableCell>
                <TableCell>{format(row.createdAt, 'yyyy-MM-dd HH:mm')}</TableCell>
                <TableCell>
                  <DeptRowActions row={row} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className='h-24 text-center'>
                没有查询到部门数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
