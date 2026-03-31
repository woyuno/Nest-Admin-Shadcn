export type RoleRowAction = 'edit' | 'data-scope' | 'delete'

export function getRoleRowActions(roleId: number): RoleRowAction[] {
  if (roleId === 1) {
    return []
  }

  return ['edit', 'data-scope', 'delete']
}
