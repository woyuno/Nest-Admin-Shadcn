import { type Row } from '@tanstack/react-table'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useQueryClient } from '@tanstack/react-query'
import { Trash2, UserPen } from 'lucide-react'
import { getLayoutMode, useLayout } from '@/context/layout-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import { fetchNoticeDetail, noticeDetailQueryKey } from '../api/notices'
import { type Notice } from '../data/schema'
import { useNotices } from './notices-provider'

type DataTableRowActionsProps = {
  row: Row<Notice>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const queryClient = useQueryClient()
  const { setOpen, setCurrentRow } = useNotices()
  const { open } = useSidebar()
  const { collapsible, contentWidth } = useLayout()
  const isWideLayout =
    getLayoutMode({ open, collapsible, contentWidth }) === 'offcanvas'

  if (!isWideLayout) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>更多操作</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <PermissionGuard permissions={['system:notice:edit']}>
            <DropdownMenuItem
              onPointerEnter={() => {
                void queryClient.prefetchQuery({
                  queryKey: noticeDetailQueryKey(row.original.noticeId),
                  queryFn: () => fetchNoticeDetail(row.original.noticeId),
                  staleTime: 60 * 1000,
                })
              }}
              onClick={() => {
                void queryClient.prefetchQuery({
                  queryKey: noticeDetailQueryKey(row.original.noticeId),
                  queryFn: () => fetchNoticeDetail(row.original.noticeId),
                  staleTime: 60 * 1000,
                })
                setCurrentRow(row.original)
                setOpen('edit')
              }}
            >
              <UserPen className='size-4' />
              编辑
            </DropdownMenuItem>
          </PermissionGuard>
          <PermissionGuard permissions={['system:notice:remove']}>
            <DropdownMenuItem
              variant='destructive'
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('delete')
              }}
            >
              <Trash2 className='size-4' />
              删除
            </DropdownMenuItem>
          </PermissionGuard>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className='flex flex-wrap items-center gap-1'>
      <PermissionGuard permissions={['system:notice:edit']}>
        <Button
          variant='ghost'
          size='sm'
          onPointerEnter={() => {
            void queryClient.prefetchQuery({
              queryKey: noticeDetailQueryKey(row.original.noticeId),
              queryFn: () => fetchNoticeDetail(row.original.noticeId),
              staleTime: 60 * 1000,
            })
          }}
          onClick={() => {
            void queryClient.prefetchQuery({
              queryKey: noticeDetailQueryKey(row.original.noticeId),
              queryFn: () => fetchNoticeDetail(row.original.noticeId),
              staleTime: 60 * 1000,
            })
            setCurrentRow(row.original)
            setOpen('edit')
          }}
        >
          <UserPen className='me-1 size-4' />
          编辑
        </Button>
      </PermissionGuard>
      <PermissionGuard permissions={['system:notice:remove']}>
        <Button
          variant='ghost'
          size='sm'
          className='text-red-500 hover:text-red-500'
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('delete')
          }}
        >
          <Trash2 className='me-1 size-4' />
          删除
        </Button>
      </PermissionGuard>
    </div>
  )
}

