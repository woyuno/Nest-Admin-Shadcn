import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type OperlogItem } from '../data/schema'
import { getOperlogBusinessTypeLabel } from '../lib/operlog-contract'

type OperlogDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: OperlogItem | null
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <div className='mb-1 text-xs text-muted-foreground'>{label}</div>
      <div className='whitespace-pre-wrap break-all rounded-md bg-muted/60 p-3 text-sm'>
        {value || '-'}
      </div>
    </div>
  )
}

export function OperlogDetailDialog({
  open,
  onOpenChange,
  currentRow,
}: OperlogDetailDialogProps) {
  if (!currentRow) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>操作日志详情</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 md:grid-cols-2'>
          <DetailItem
            label='操作模块'
            value={`${currentRow.title} / ${getOperlogBusinessTypeLabel(currentRow.businessType)}`}
          />
          <DetailItem
            label='登录信息'
            value={`${currentRow.operName} / ${currentRow.operIp} / ${currentRow.operLocation || '-'}`}
          />
          <DetailItem label='请求地址' value={currentRow.operUrl} />
          <DetailItem label='请求方式' value={currentRow.requestMethod} />
          <DetailItem label='操作方法' value={currentRow.method} className='md:col-span-2' />
          <DetailItem label='请求参数' value={currentRow.operParam} className='md:col-span-2' />
          <DetailItem label='返回参数' value={currentRow.jsonResult} className='md:col-span-2' />
          <DetailItem
            label='操作状态'
            value={currentRow.status === 'success' ? '正常' : '失败'}
          />
          <DetailItem label='耗时' value={`${currentRow.costTime} 毫秒`} />
          <DetailItem
            label='操作时间'
            value={format(currentRow.operTime, 'yyyy-MM-dd HH:mm:ss')}
          />
          {currentRow.status === 'error' ? (
            <DetailItem
              label='异常信息'
              value={currentRow.errorMsg}
              className='md:col-span-2'
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
