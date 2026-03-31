import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusToneClasses = {
  positive: 'bg-teal-100/30 text-teal-900 border-teal-200 dark:text-teal-200',
  neutral: 'bg-neutral-300/40 border-neutral-300 text-foreground',
  info: 'bg-sky-200/40 text-sky-900 border-sky-300 dark:text-sky-100',
  warning:
    'bg-amber-100/50 text-amber-900 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-400/30',
  danger:
    'bg-destructive/10 text-destructive border-destructive/10 dark:bg-destructive/50 dark:text-primary',
} as const

type StatusTone = keyof typeof statusToneClasses

export function StatusBadge({
  label,
  tone,
  className,
}: {
  label: string
  tone: StatusTone
  className?: string
}) {
  return (
    <Badge variant='outline' className={cn('capitalize', statusToneClasses[tone], className)}>
      {label}
    </Badge>
  )
}

export function ActiveStatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return (
    <StatusBadge
      label={status === 'active' ? '启用' : '停用'}
      tone={status === 'active' ? 'positive' : 'neutral'}
    />
  )
}

export function PublishStatusBadge({
  status,
}: {
  status: 'published' | 'draft'
}) {
  return (
    <StatusBadge
      label={status === 'published' ? '正常发布' : '停用草稿'}
      tone={status === 'published' ? 'positive' : 'neutral'}
    />
  )
}

export function SuccessStatusBadge({ status }: { status: 'success' | 'error' }) {
  return (
    <StatusBadge
      label={status === 'success' ? '成功' : '失败'}
      tone={status === 'success' ? 'positive' : 'danger'}
    />
  )
}

export function OperlogStatusBadge({ status }: { status: 'success' | 'error' }) {
  return (
    <StatusBadge
      label={status === 'success' ? '正常' : '失败'}
      tone={status === 'success' ? 'positive' : 'danger'}
    />
  )
}

export function TaskStatusBadge({ status }: { status: 'active' | 'paused' }) {
  return (
    <StatusBadge
      label={status === 'active' ? '正常' : '暂停'}
      tone={status === 'active' ? 'positive' : 'neutral'}
    />
  )
}

export function BooleanBadge({ value }: { value: boolean }) {
  return (
    <StatusBadge label={value ? '是' : '否'} tone={value ? 'positive' : 'neutral'} />
  )
}

export function VisibilityBadge({ visible }: { visible: 'show' | 'hide' }) {
  return (
    <StatusBadge
      label={visible === 'show' ? '显示' : '隐藏'}
      tone={visible === 'show' ? 'positive' : 'neutral'}
    />
  )
}

export function MenuTypeBadge({
  menuType,
}: {
  menuType: 'directory' | 'menu' | 'button'
}) {
  const mapping = {
    directory: { label: '目录', tone: 'warning' as const },
    menu: { label: '菜单', tone: 'info' as const },
    button: { label: '按钮', tone: 'neutral' as const },
  }

  return <StatusBadge {...mapping[menuType]} />
}

export function NoticeTypeBadge({
  noticeType,
}: {
  noticeType: 'notice' | 'announcement'
}) {
  return (
    <StatusBadge
      label={noticeType === 'notice' ? '通知' : '公告'}
      tone={noticeType === 'notice' ? 'info' : 'warning'}
    />
  )
}
