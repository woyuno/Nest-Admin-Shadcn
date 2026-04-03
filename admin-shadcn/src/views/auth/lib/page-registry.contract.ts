import { type FrontendPageRegistryItem } from './authorization-contract'

export function defineFrontendPageRegistry(
  items: FrontendPageRegistryItem[]
) {
  const seenRoutePaths = new Set<string>()

  for (const item of items) {
    if (!item.routePath.startsWith('/')) {
      throw new Error(`frontendPageRegistry routePath 必须以 / 开头: ${item.routePath}`)
    }

    if (
      (item.menuPaths?.length ?? 0) === 0 &&
      (item.componentKeys?.length ?? 0) === 0
    ) {
      throw new Error(
        `frontendPageRegistry 必须至少提供一个 menuPaths 或 componentKeys: ${item.routePath}`
      )
    }

    if (seenRoutePaths.has(item.routePath)) {
      throw new Error(`frontendPageRegistry routePath 重复: ${item.routePath}`)
    }

    seenRoutePaths.add(item.routePath)
  }

  return items
}
