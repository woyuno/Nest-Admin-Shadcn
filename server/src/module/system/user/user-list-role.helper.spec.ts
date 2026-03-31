import { buildAssignedUserRoles, mergeUsersWithRoles } from './user-list-role.helper';

describe('mergeUsersWithRoles', () => {
  it('adds role lists to each user for list responses', () => {
    expect(
      mergeUsersWithRoles(
        [
          { userId: 2, userName: 'ry' },
          { userId: 3, userName: 'test' },
        ],
        [
          { userId: 2, roleId: 1 },
          { userId: 2, roleId: 2 },
        ],
        [
          { roleId: 1, roleName: '超级管理员' },
          { roleId: 2, roleName: '测试角色' },
        ],
      ),
    ).toEqual([
      {
        userId: 2,
        userName: 'ry',
        roles: [
          { roleId: 1, roleName: '超级管理员' },
          { roleId: 2, roleName: '测试角色' },
        ],
      },
      {
        userId: 3,
        userName: 'test',
        roles: [],
      },
    ]);
  });

  it('ignores role mappings whose role records are missing', () => {
    expect(mergeUsersWithRoles([{ userId: 2 }], [{ userId: 2, roleId: 99 }], [])).toEqual([
      {
        userId: 2,
        roles: [],
      },
    ]);
  });

  it('keeps only assigned roles in auth-role selections', () => {
    expect(
      buildAssignedUserRoles(
        [
          { roleId: 1, roleName: '超级管理员' },
          { roleId: 2, roleName: '普通角色' },
        ],
        [2],
      ),
    ).toEqual([
      {
        roleId: 2,
        roleName: '普通角色',
        flag: true,
      },
    ]);
  });
});
