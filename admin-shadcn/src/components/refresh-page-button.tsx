import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { refreshCurrentPage } from '@/components/data-table/refresh-current-page'

type RefreshPageButtonProps = React.ComponentProps<typeof Button>

export function RefreshPageButton({
  className,
  children,
  disabled,
  ...props
}: RefreshPageButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  return (
    <Button
      variant='outline'
      {...props}
      className={cn('gap-1.5', className)}
      disabled={disabled || isRefreshing}
      aria-label='刷新当前页面数据'
      onClick={async (event) => {
        await props.onClick?.(event)
        if (event.defaultPrevented) return

        setIsRefreshing(true)
        try {
          await refreshCurrentPage({ queryClient, router })
        } finally {
          setIsRefreshing(false)
        }
      }}
    >
      <RefreshCw
        className={cn('size-4', isRefreshing && 'animate-spin')}
        aria-hidden='true'
      />
      {children ?? (isRefreshing ? '刷新中' : '刷新')}
    </Button>
  )
}
