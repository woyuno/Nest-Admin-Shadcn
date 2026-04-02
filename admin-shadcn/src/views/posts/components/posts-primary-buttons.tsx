import { useState } from 'react'
import { BriefcaseBusiness, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import { downloadBlob } from '@/lib/download-blob'
import { exportPosts } from '../api/posts'
import { type PostsSearch } from '../lib/post-contract'
import { usePosts } from './posts-provider'

type PostsPrimaryButtonsProps = {
  search?: PostsSearch
}

export function PostsPrimaryButtons({ search = {} }: PostsPrimaryButtonsProps) {
  const { setOpen } = usePosts()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const blob = await exportPosts(search)
      downloadBlob(blob, `岗位列表-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('岗位导出任务已完成')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className='flex gap-2'>
      <PermissionGuard permissions={['system:post:add']}>
        <Button className='space-x-1' onClick={() => setOpen('add')}>
          <span>新增岗位</span> <BriefcaseBusiness size={18} />
        </Button>
      </PermissionGuard>
      <PermissionGuard permissions={['system:post:export']}>
        <Button
          variant='secondary'
          className='space-x-1'
          onClick={handleExport}
          disabled={isExporting}
        >
          <span>{isExporting ? '导出中' : '导出岗位'}</span> <FileDown size={18} />
        </Button>
      </PermissionGuard>
    </div>
  )
}

