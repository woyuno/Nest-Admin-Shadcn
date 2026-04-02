import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type DeptTreeNode = {
  id: number
  label: string
  children?: DeptTreeNode[]
}

type UsersDeptFilterProps = {
  data: DeptTreeNode[]
  selectedDeptId?: string
  onSelect: (deptId?: string) => void
}

type FilteredDeptNode = DeptTreeNode & {
  children?: FilteredDeptNode[]
}

function filterDeptTree(nodes: DeptTreeNode[], keyword: string): FilteredDeptNode[] {
  if (!keyword) {
    return nodes
  }

  return nodes.flatMap((node) => {
    const children = filterDeptTree(node.children ?? [], keyword)
    if (node.label.includes(keyword) || children.length > 0) {
      return [{ ...node, children }]
    }

    return []
  })
}

export function UsersDeptFilter({
  data,
  selectedDeptId,
  onSelect,
}: UsersDeptFilterProps) {
  const [keyword, setKeyword] = useState('')
  const allExpandableIds = useMemo(() => {
    const ids = new Set<number>()
    const walk = (nodes: DeptTreeNode[]) => {
      nodes.forEach((node) => {
        if ((node.children ?? []).length > 0) {
          ids.add(node.id)
          walk(node.children ?? [])
        }
      })
    }
    walk(data)
    return ids
  }, [data])
  const [expandedIds, setExpandedIds] = useState<Set<number>>(allExpandableIds)

  useEffect(() => {
    setExpandedIds(allExpandableIds)
  }, [allExpandableIds])

  const filteredTree = useMemo(
    () => filterDeptTree(data, keyword.trim()),
    [data, keyword]
  )

  const renderNodes = (nodes: FilteredDeptNode[], level = 0) =>
    nodes.map((node) => {
      const hasChildren = (node.children ?? []).length > 0
      const isExpanded = keyword.trim()
        ? true
        : expandedIds.has(node.id) || selectedDeptId === String(node.id)
      const isSelected = selectedDeptId === String(node.id)

      return (
        <div key={node.id} className='space-y-1'>
          <div
            className='flex items-center gap-1 rounded-md px-2 py-1 hover:bg-muted'
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
                aria-label={isExpanded ? '折叠部门' : '展开部门'}
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
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground'
              }`}
              onClick={() => onSelect(String(node.id))}
            >
              {node.label}
            </button>
          </div>
          {hasChildren && isExpanded ? renderNodes(node.children ?? [], level + 1) : null}
        </div>
      )
    })

  return (
    <aside className='flex w-full flex-col gap-3 rounded-lg border bg-card p-4 lg:w-72'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='font-medium'>部门筛选</h3>
          <p className='text-sm text-muted-foreground'>按部门快速过滤用户列表</p>
        </div>
        {selectedDeptId ? (
          <Button variant='ghost' size='icon' onClick={() => onSelect(undefined)}>
            <X className='size-4' />
            <span className='sr-only'>清除部门筛选</span>
          </Button>
        ) : null}
      </div>
      <div className='relative'>
        <Search className='pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder='输入部门名称筛选'
          className='ps-9'
        />
      </div>
      <div className='max-h-[32rem] overflow-y-auto'>
        <button
          type='button'
          className={`mb-2 w-full rounded-md px-3 py-2 text-left text-sm ${
            selectedDeptId
              ? 'hover:bg-muted'
              : 'bg-primary text-primary-foreground'
          }`}
          onClick={() => onSelect(undefined)}
        >
          全部部门
        </button>
        <div className='space-y-1'>
          {filteredTree.length > 0 ? (
            renderNodes(filteredTree)
          ) : (
            <p className='px-2 py-6 text-center text-sm text-muted-foreground'>
              没有匹配的部门
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}
