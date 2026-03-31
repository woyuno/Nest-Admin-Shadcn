import { type NavGroup } from '@/components/layout/types'
import { resolveMenuIcon } from '@/features/menus/lib/menu-icon-registry'

export type BackendMenuRoute = {
  path: string
  component?: string
  hidden?: boolean
  meta?: {
    title?: string
    icon?: string
  } | null
  children?: BackendMenuRoute[]
}

export type FrontendPageRegistryItem = {
  routePath: string
  title: string
  menuPaths?: string[]
  componentKeys?: string[]
  requiredPermissions?: string[]
  requiredRoles?: string[]
}

type SidebarBuildResult = {
  navGroups: NavGroup[]
  allowedRoutePaths: string[]
  warnings: string[]
}

type RouteAccessInput = {
  pathname: string
  permissions?: string[]
  roles?: string[]
  registry: FrontendPageRegistryItem[]
}

type NavLinkItem = Extract<NavGroup['items'][number], { url: unknown }>

const ALL_PERMISSION = '*:*:*'
const SUPER_ADMIN = 'admin'

export function normalizePath(path: string) {
  if (!path) {
    return '/'
  }

  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
}

function isExternalUrl(path: string) {
  return /^https?:\/\//i.test(path)
}

function normalizeExternalUrl(path: string) {
  if (isExternalUrl(path)) {
    return path
  }

  const normalized = path.replace(/^\/+/, '')
  if (/^https?:\/[^/]/i.test(normalized)) {
    return normalized.replace(/^https?:\//i, (prefix) => `${prefix}/`)
  }

  return path
}

function joinMenuPath(parentPath: string | null, currentPath: string) {
  if (isExternalUrl(currentPath)) {
    return currentPath
  }

  if (!parentPath || currentPath.startsWith('/')) {
    return normalizePath(currentPath)
  }

  return normalizePath(`${parentPath}/${currentPath}`)
}

function matchesRegistryEntry(
  menu: BackendMenuRoute,
  fullPath: string,
  entry: FrontendPageRegistryItem
) {
  const normalizedMenuPath = normalizePath(fullPath)
  const menuPaths = entry.menuPaths?.map(normalizePath) ?? []
  const componentKeys = entry.componentKeys ?? []

  return (
    menuPaths.includes(normalizedMenuPath) ||
    (!!menu.component && componentKeys.includes(menu.component))
  )
}

function findRegistryEntry(
  menu: BackendMenuRoute,
  fullPath: string,
  registry: FrontendPageRegistryItem[]
) {
  return registry.find((entry) => matchesRegistryEntry(menu, fullPath, entry))
}

function resolveExternalMenuUrl(menu: BackendMenuRoute, fullPath: string) {
  const candidates = [menu.path, fullPath]
  for (const candidate of candidates) {
    const normalized = normalizeExternalUrl(candidate)
    if (isExternalUrl(normalized)) {
      return normalized
    }
  }

  return null
}

function collectSidebarItems(
  menus: BackendMenuRoute[],
  registry: FrontendPageRegistryItem[],
  warnings: string[],
  parentPath: string | null = null
) {
  const items: NavGroup['items'] = []
  const allowedRoutePaths = new Set<string>()

  for (const menu of menus) {
    if (menu.hidden) {
      continue
    }

    const fullPath = joinMenuPath(parentPath, menu.path)
    const title = menu.meta?.title || fullPath
    const children = menu.children ?? []

    if (children.length > 0) {
      const childResult = collectLeafLinks(children, registry, warnings, fullPath)
      childResult.allowedRoutePaths.forEach((path) => allowedRoutePaths.add(path))

      if (childResult.items.length > 0) {
        items.push({
          title,
          icon: resolveMenuIcon(menu.meta?.icon),
          items: childResult.items,
        })
        continue
      }
    }

    const externalUrl = resolveExternalMenuUrl(menu, fullPath)
    if (externalUrl) {
      items.push({
        title,
        icon: resolveMenuIcon(menu.meta?.icon),
        url: externalUrl,
      })
      continue
    }

    const entry = findRegistryEntry(menu, fullPath, registry)
    if (!entry) {
      warnings.push(
        `未找到后端菜单映射: ${title} (${fullPath}) -> ${menu.component || 'unknown'}`
      )
      continue
    }

    items.push({
      title,
      icon: resolveMenuIcon(menu.meta?.icon),
      url: entry.routePath,
    })
    allowedRoutePaths.add(entry.routePath)
  }

  return {
    items,
    allowedRoutePaths,
  }
}

function collectLeafLinks(
  menus: BackendMenuRoute[],
  registry: FrontendPageRegistryItem[],
  warnings: string[],
  parentPath: string | null = null
) {
  const items: NavLinkItem[] = []
  const allowedRoutePaths = new Set<string>()

  for (const menu of menus) {
    if (menu.hidden) {
      continue
    }

    const fullPath = joinMenuPath(parentPath, menu.path)
    const title = menu.meta?.title || fullPath
    const children = menu.children ?? []

    if (children.length > 0) {
      const nested = collectLeafLinks(children, registry, warnings, fullPath)
      nested.items.forEach((item) => items.push(item))
      nested.allowedRoutePaths.forEach((path) => allowedRoutePaths.add(path))
      continue
    }

    const externalUrl = resolveExternalMenuUrl(menu, fullPath)
    if (externalUrl) {
      items.push({
        title,
        icon: resolveMenuIcon(menu.meta?.icon),
        url: externalUrl,
      } as NavLinkItem)
      continue
    }

    const entry = findRegistryEntry(menu, fullPath, registry)
    if (!entry) {
      warnings.push(
        `未找到后端菜单映射: ${title} (${fullPath}) -> ${menu.component || 'unknown'}`
      )
      continue
    }

    items.push({
      title,
      icon: resolveMenuIcon(menu.meta?.icon),
      url: entry.routePath,
    } as NavLinkItem)
    allowedRoutePaths.add(entry.routePath)
  }

  return {
    items,
    allowedRoutePaths,
  }
}

export function buildSidebarGroupsFromMenus(
  menus: BackendMenuRoute[],
  registry: FrontendPageRegistryItem[]
): SidebarBuildResult {
  const warnings: string[] = []
  const navGroups: NavGroup[] = []
  const allowedRoutePaths = new Set<string>()

  for (const menu of menus) {
    if (menu.hidden) {
      continue
    }

    const groupTitle = menu.meta?.title || normalizePath(menu.path)
    const fullPath = normalizePath(menu.path)
    const children = menu.children ?? []

    if (children.length > 0) {
      const result = collectSidebarItems(children, registry, warnings, fullPath)
      if (result.items.length > 0) {
        navGroups.push({
          title: groupTitle,
          items: result.items,
        })
        result.allowedRoutePaths.forEach((path) => allowedRoutePaths.add(path))
      }
      continue
    }

    const externalUrl = resolveExternalMenuUrl(menu, fullPath)
    if (externalUrl) {
      navGroups.push({
        title: '快捷入口',
        items: [{ title: groupTitle, icon: resolveMenuIcon(menu.meta?.icon), url: externalUrl }],
      })
      continue
    }

    const entry = findRegistryEntry(menu, fullPath, registry)
    if (!entry) {
      warnings.push(
        `未找到后端菜单映射: ${groupTitle} (${fullPath}) -> ${menu.component || 'unknown'}`
      )
      continue
    }

    navGroups.push({
      title: '快捷入口',
      items: [{ title: groupTitle, icon: resolveMenuIcon(menu.meta?.icon), url: entry.routePath }],
    })
    allowedRoutePaths.add(entry.routePath)
  }

  return {
    navGroups,
    allowedRoutePaths: Array.from(allowedRoutePaths),
    warnings,
  }
}

export function hasPermission(
  ownedPermissions: string[],
  requiredPermissions?: string[]
) {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }

  if (ownedPermissions.includes(ALL_PERMISSION)) {
    return true
  }

  return requiredPermissions.every((permission) =>
    ownedPermissions.includes(permission)
  )
}

export function hasRole(ownedRoles: string[], requiredRoles?: string[]) {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true
  }

  if (ownedRoles.includes(SUPER_ADMIN)) {
    return true
  }

  return requiredRoles.every((role) => ownedRoles.includes(role))
}

export function canAccessRoute({
  pathname,
  permissions = [],
  roles = [],
  registry,
}: RouteAccessInput) {
  const entry = registry.find(
    (item) => normalizePath(item.routePath) === normalizePath(pathname)
  )

  if (!entry) {
    return true
  }

  return (
    hasPermission(permissions, entry.requiredPermissions) &&
    hasRole(roles, entry.requiredRoles)
  )
}
