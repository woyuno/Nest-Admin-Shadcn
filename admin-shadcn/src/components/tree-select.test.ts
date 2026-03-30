import { describe, expect, it } from 'vitest'
import { type TreeSelectNode } from './tree-select'
import { collectExpandableTreeIds, findTreePathLabels } from './tree-select.utils'

const sampleTree: TreeSelectNode[] = [
  {
    id: '100',
    label: '研发中心',
    children: [
      {
        id: '101',
        label: '前端组',
        children: [{ id: '102', label: '后台组' }],
      },
    ],
  },
]

describe('tree-select helpers', () => {
  it('collects all expandable node ids', () => {
    expect(collectExpandableTreeIds(sampleTree)).toEqual(new Set(['100', '101']))
  })

  it('finds the full label path for a selected node', () => {
    expect(findTreePathLabels(sampleTree, '102')).toEqual(['研发中心', '前端组', '后台组'])
  })

  it('returns null when target node does not exist', () => {
    expect(findTreePathLabels(sampleTree, '999')).toBeNull()
  })
})
