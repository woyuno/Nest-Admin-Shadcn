import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { type MenuTreeNode } from '../lib/menu-contract'

type MenusTreeSelectProps = {
  data: MenuTreeNode[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

function findMenuPath(
  nodes: MenuTreeNode[],
  targetId: string,
  labels: string[] = []
): string[] | null {
  for (const node of nodes) {
    const nextLabels = [...labels, node.menuName]
    if (String(node.menuId) === targetId) {
      return nextLabels
    }

    const nested = findMenuPath(node.children ?? [], targetId, nextLabels)
    if (nested) {
      return nested
    }
  }

  return null
}

function collectExpandableIds(nodes: MenuTreeNode[]) {
  const ids = new Set<number>()
  const walk = (items: MenuTreeNode[]) => {
    items.forEach((item) => {
      if ((item.children ?? []).length > 0) {
        ids.add(item.menuId)
        walk(item.children ?? [])
      }
    })
  }
  walk(nodes)
  return ids
}

export function MenusTreeSelect({
  data,
  value,
  onValueChange,
  placeholder = '请选择上级菜单',
}: MenusTreeSelectProps) {
  const expandableIds = useMemo(() => collectExpandableIds(data), [data])
  const [open, setOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(expandableIds)

  useEffect(() => {
    setExpandedIds(expandableIds)
  }, [expandableIds])

  const currentLabel =
    value === '0'
      ? '主类目'
      : findMenuPath(data, value)?.join(' / ') ?? placeholder

  const renderNodes = (nodes: MenuTreeNode[], depth = 0) =>
    nodes.map((node) => {
      const hasChildren = (node.children ?? []).length > 0
      const isExpanded = expandedIds.has(node.menuId)
      const isSelected = value === String(node.menuId)

      return (
        <div key={node.menuId} className='space-y-1'>
          <div
            className='flex items-center gap-1 rounded-md px-2 py-1 hover:bg-muted'
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {hasChildren ? (
              <button
                type='button'
                className='inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent'
                onClick={(event) => {
                  event.stopPropagation()
                  setExpandedIds((prev) => {
                    const next = new Set(prev)
                    if (next.has(node.menuId)) {
                      next.delete(node.menuId)
                    } else {
                      next.add(node.menuId)
                    }
                    return next
                  })
                }}
              >
                {isExpanded ? (
                  <ChevronDown className='size-4' />
                ) : (
                  <ChevronRight className='size-4' />
                )}
              </button>
            ) : (
              <span className='inline-block size-5' />
            )}
            <button
              type='button'
              className={`flex-1 rounded-sm px-2 py-1 text-left text-sm ${
                isSelected ? 'bg-primary text-primary-foreground' : 'text-foreground'
              }`}
              onClick={() => {
                onValueChange(String(node.menuId))
                setOpen(false)
              }}
            >
              {node.menuName}
            </button>
          </div>
          {hasChildren && isExpanded ? renderNodes(node.children ?? [], depth + 1) : null}
        </div>
      )
    })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' className='w-full justify-between font-normal'>
          <span className='truncate'>{currentLabel}</span>
          <ChevronDown className='ms-2 size-4 shrink-0 text-muted-foreground' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-[var(--radix-popover-trigger-width)] p-2'>
        <div className='max-h-80 overflow-y-auto'>
          <button
            type='button'
            className={`mb-2 w-full rounded-md px-3 py-2 text-left text-sm ${
              value === '0' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            onClick={() => {
              onValueChange('0')
              setOpen(false)
            }}
          >
            主类目
          </button>
          <div className='space-y-1'>{renderNodes(data)}</div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
