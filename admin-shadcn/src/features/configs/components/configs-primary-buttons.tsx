import { useState } from 'react'
import { FileDown, Plus, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/features/auth/components/permission-guard'
import { downloadBlob } from '@/lib/download-blob'
import {
  exportConfigs,
  refreshConfigsCache,
} from '../api/configs'
import { type ConfigsSearch } from '../lib/config-contract'
import { useConfigs } from './configs-provider'

type ConfigsPrimaryButtonsProps = {
  search?: ConfigsSearch
}

export function ConfigsPrimaryButtons({
  search = {},
}: ConfigsPrimaryButtonsProps) {
  const { setOpen } = useConfigs()
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const blob = await exportConfigs(search)
      downloadBlob(blob, `参数配置-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('参数导出任务已完成')
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefreshCache = async () => {
    try {
      setIsRefreshing(true)
      await refreshConfigsCache()
      toast.success('参数缓存已刷新')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className='flex flex-wrap gap-2'>
      <PermissionGuard permissions={['system:config:add']}>
        <Button className='space-x-1' onClick={() => setOpen('add')}>
          <span>新增参数</span> <Plus size={18} />
        </Button>
      </PermissionGuard>
      <PermissionGuard permissions={['system:config:export']}>
        <Button
          variant='secondary'
          className='space-x-1'
          onClick={handleExport}
          disabled={isExporting}
        >
          <span>{isExporting ? '导出中' : '导出参数'}</span> <FileDown size={18} />
        </Button>
      </PermissionGuard>
      <PermissionGuard permissions={['system:config:remove']}>
        <Button
          variant='outline'
          className='space-x-1'
          onClick={handleRefreshCache}
          disabled={isRefreshing}
        >
          <span>{isRefreshing ? '刷新中' : '刷新缓存'}</span>{' '}
          <RefreshCcw size={18} />
        </Button>
      </PermissionGuard>
    </div>
  )
}
