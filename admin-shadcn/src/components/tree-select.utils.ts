import { type TreeSelectNode } from './tree-select'

export function findTreePathLabels(
  nodes: TreeSelectNode[],
  targetId: string,
  labels: string[] = []
): string[] | null {
  for (const node of nodes) {
    const nextLabels = [...labels, node.label]
    if (node.id === targetId) {
      return nextLabels
    }

    const nested = findTreePathLabels(node.children ?? [], targetId, nextLabels)
    if (nested) {
      return nested
    }
  }

  return null
}

export function collectExpandableTreeIds(nodes: TreeSelectNode[]) {
  const ids = new Set<string>()

  const walk = (items: TreeSelectNode[]) => {
    items.forEach((item) => {
      if ((item.children ?? []).length > 0) {
        ids.add(item.id)
        walk(item.children ?? [])
      }
    })
  }

  walk(nodes)
  return ids
}
