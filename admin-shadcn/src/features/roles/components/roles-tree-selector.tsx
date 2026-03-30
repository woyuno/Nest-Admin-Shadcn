import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

export type RoleTreeNode = {
  id: number
  label: string
  children?: RoleTreeNode[]
}

type RolesTreeSelectorProps = {
  data: RoleTreeNode[]
  checkedIds: number[]
  onCheckedIdsChange: (checkedIds: number[]) => void
  strictMode: boolean
}

function collectNodeIds(nodes: RoleTreeNode[]): number[] {
  return nodes.flatMap((node) => [node.id, ...collectNodeIds(node.children ?? [])])
}

function collectDescendantIds(node: RoleTreeNode): number[] {
  return [node.id, ...collectNodeIds(node.children ?? [])]
}

export function RolesTreeSelector({
  data,
  checkedIds,
  onCheckedIdsChange,
  strictMode,
}: RolesTreeSelectorProps) {
  const allIds = useMemo(() => collectNodeIds(data), [data])
  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () => new Set(allIds)
  )

  const setExpandedAll = (expanded: boolean) => {
    setExpandedIds(expanded ? new Set(allIds) : new Set())
  }

  const toggleChecked = (node: RoleTreeNode, nextChecked: boolean) => {
    const targetIds = strictMode ? [node.id] : collectDescendantIds(node)

    const next = new Set(checkedIds)
    targetIds.forEach((id) => {
      if (nextChecked) {
        next.add(id)
      } else {
        next.delete(id)
      }
    })

    onCheckedIdsChange([...next])
  }

  const renderNodes = (nodes: RoleTreeNode[], level = 0) =>
    nodes.map((node) => {
      const hasChildren = (node.children ?? []).length > 0
      const isExpanded = expandedIds.has(node.id)
      const isChecked = checkedIds.includes(node.id)

      return (
        <div key={node.id} className='space-y-1'>
          <div
            className='flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted'
            style={{ paddingLeft: `${level * 12 + 8}px` }}
          >
            {hasChildren ? (
              <button
                type='button'
                className='inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent'
                onClick={() =>
                  setExpandedIds((prev) => {
                    const next = new Set(prev)
                    if (next.has(node.id)) {
                      next.delete(node.id)
                    } else {
                      next.add(node.id)
                    }
                    return next
                  })
                }
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
            <label className='flex flex-1 items-center gap-2 text-sm'>
              <Checkbox
                checked={isChecked}
                onCheckedChange={(nextChecked) =>
                  toggleChecked(node, Boolean(nextChecked))
                }
              />
              <span>{node.label}</span>
            </label>
          </div>
          {hasChildren && isExpanded ? renderNodes(node.children ?? [], level + 1) : null}
        </div>
      )
    })

  return (
    <div className='space-y-3 rounded-md border p-3'>
      <div className='flex flex-wrap gap-3 text-sm text-muted-foreground'>
        <button
          type='button'
          className='underline-offset-4 hover:underline'
          onClick={() => setExpandedAll(true)}
        >
          展开全部
        </button>
        <button
          type='button'
          className='underline-offset-4 hover:underline'
          onClick={() => setExpandedAll(false)}
        >
          收起全部
        </button>
        <button
          type='button'
          className='underline-offset-4 hover:underline'
          onClick={() => onCheckedIdsChange(allIds)}
        >
          全选
        </button>
        <button
          type='button'
          className='underline-offset-4 hover:underline'
          onClick={() => onCheckedIdsChange([])}
        >
          清空
        </button>
      </div>
      <div className='max-h-[20rem] overflow-y-auto'>
        {data.length > 0 ? (
          renderNodes(data)
        ) : (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            暂无可选数据
          </p>
        )}
      </div>
    </div>
  )
}
