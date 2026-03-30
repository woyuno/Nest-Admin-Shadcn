import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { collectExpandableTreeIds, findTreePathLabels } from './tree-select.utils'

export type TreeSelectNode = {
  id: string
  label: string
  children?: TreeSelectNode[]
}

type TreeSelectProps = {
  data: TreeSelectNode[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  rootOption?: {
    label: string
    value: string
  }
}

export function TreeSelect({
  data,
  value,
  onValueChange,
  placeholder = '请选择',
  rootOption,
}: TreeSelectProps) {
  const expandableIds = useMemo(() => collectExpandableTreeIds(data), [data])
  const [open, setOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(expandableIds)

  useEffect(() => {
    setExpandedIds(expandableIds)
  }, [expandableIds])

  const currentLabel =
    rootOption && value === rootOption.value
      ? rootOption.label
      : findTreePathLabels(data, value)?.join(' / ') ?? placeholder

  const renderNodes = (nodes: TreeSelectNode[], depth = 0) =>
    nodes.map((node) => {
      const hasChildren = (node.children ?? []).length > 0
      const isExpanded = expandedIds.has(node.id)
      const isSelected = value === node.id

      return (
        <div key={node.id} className='space-y-1'>
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
                    if (next.has(node.id)) {
                      next.delete(node.id)
                    } else {
                      next.add(node.id)
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
                onValueChange(node.id)
                setOpen(false)
              }}
            >
              {node.label}
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
          {rootOption ? (
            <button
              type='button'
              className={`mb-2 w-full rounded-md px-3 py-2 text-left text-sm ${
                value === rootOption.value
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => {
                onValueChange(rootOption.value)
                setOpen(false)
              }}
            >
              {rootOption.label}
            </button>
          ) : null}
          <div className='space-y-1'>
            {data.length > 0 ? (
              renderNodes(data)
            ) : (
              <p className='py-6 text-center text-sm text-muted-foreground'>暂无可选数据</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
