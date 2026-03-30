import { ChevronDown, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type Menu } from '../data/schema'
import { MenuRowActions } from './menu-row-actions'

type VisibleMenuRow = Menu & {
  depth: number
  hasChildren: boolean
}

type MenusTableProps = {
  rows: VisibleMenuRow[]
  isLoading: boolean
  expandedIds: Set<number>
  onToggleExpand: (menuId: number) => void
}

function getMenuTypeLabel(menuType: Menu['menuType']) {
  switch (menuType) {
    case 'directory':
      return '目录'
    case 'menu':
      return '菜单'
    default:
      return '按钮'
  }
}

export function MenusTable({
  rows,
  isLoading,
  expandedIds,
  onToggleExpand,
}: MenusTableProps) {
  return (
    <div className='overflow-hidden rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[280px]'>菜单名称</TableHead>
            <TableHead className='w-[90px]'>类型</TableHead>
            <TableHead className='w-[80px]'>排序</TableHead>
            <TableHead className='w-[120px]'>图标</TableHead>
            <TableHead className='w-[220px]'>权限标识</TableHead>
            <TableHead className='w-[220px]'>组件路径</TableHead>
            <TableHead className='w-[100px]'>显示</TableHead>
            <TableHead className='w-[100px]'>状态</TableHead>
            <TableHead className='w-[180px]'>创建时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={10} className='h-24 text-center text-muted-foreground'>
                正在加载菜单数据...
              </TableCell>
            </TableRow>
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.menuId}>
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
                        onClick={() => onToggleExpand(row.menuId)}
                      >
                        {expandedIds.has(row.menuId) ? (
                          <ChevronDown className='size-4' />
                        ) : (
                          <ChevronRight className='size-4' />
                        )}
                      </Button>
                    ) : (
                      <span className='inline-block size-7' />
                    )}
                    <span>{row.menuName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>{getMenuTypeLabel(row.menuType)}</Badge>
                </TableCell>
                <TableCell>{row.orderNum}</TableCell>
                <TableCell>{row.icon || '-'}</TableCell>
                <TableCell>{row.perms || '-'}</TableCell>
                <TableCell>{row.component || '-'}</TableCell>
                <TableCell>{row.visible === 'show' ? '显示' : '隐藏'}</TableCell>
                <TableCell>{row.status === 'active' ? '启用' : '停用'}</TableCell>
                <TableCell>{format(row.createdAt, 'yyyy-MM-dd HH:mm')}</TableCell>
                <TableCell>
                  <MenuRowActions row={row} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className='h-24 text-center'>
                没有查询到菜单数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
