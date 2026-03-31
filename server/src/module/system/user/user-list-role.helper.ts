type UserWithId = {
  userId: number;
};

type UserRoleMapping = {
  userId: number;
  roleId: number;
};

type RoleWithId = {
  roleId: number;
};

export function mergeUsersWithRoles<TUser extends UserWithId, TRole extends RoleWithId>(users: TUser[], userRoleMappings: UserRoleMapping[], roles: TRole[]): Array<TUser & { roles: TRole[] }> {
  if (users.length === 0) {
    return [];
  }

  const rolesById = new Map<number, TRole>();
  for (const role of roles) {
    rolesById.set(role.roleId, role);
  }

  const rolesByUserId = new Map<number, TRole[]>();
  for (const mapping of userRoleMappings) {
    const role = rolesById.get(mapping.roleId);
    if (!role) {
      continue;
    }

    const currentRoles = rolesByUserId.get(mapping.userId) ?? [];
    currentRoles.push(role);
    rolesByUserId.set(mapping.userId, currentRoles);
  }

  return users.map((user) => ({
    ...user,
    roles: rolesByUserId.get(user.userId) ?? [],
  }));
}

export function buildAssignedUserRoles<TRole extends RoleWithId>(roles: TRole[], roleIds: number[]) {
  const assignedRoleIds = new Set(roleIds);
  return roles
    .filter((role) => assignedRoleIds.has(role.roleId))
    .map((role) => ({
      ...role,
      flag: true,
    }));
}
