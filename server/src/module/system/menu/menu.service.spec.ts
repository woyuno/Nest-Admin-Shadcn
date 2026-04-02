import { MenuService } from './menu.service';

describe('MenuService', () => {
  const createService = () => {
    const prisma = {
      sysMenu: {
        findMany: jest.fn(),
      },
      sysRoleMenu: {
        findMany: jest.fn(),
      },
    };

    const userService = {
      getRoleIds: jest.fn().mockResolvedValue([2, 3]),
    };

    const legacyMenuRepo = {
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
    };
    const legacyRoleMenuRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const service =
      MenuService.length >= 3
        ? new (MenuService as any)(userService, legacyMenuRepo, legacyRoleMenuRepo)
        : new (MenuService as any)(prisma, userService);

    return {
      service,
      prisma,
      userService,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build router menus from role-bound menu ids via Prisma queries', async () => {
    const { service, prisma, userService } = createService();
    prisma.sysRoleMenu.findMany.mockResolvedValue([{ menuId: 100 }, { menuId: 101 }, { menuId: 100 }]);
    prisma.sysMenu.findMany.mockResolvedValue([
      {
        menuId: 100,
        parentId: 0,
        menuName: '系统管理',
        path: 'system',
        component: 'Layout',
        query: '',
        isFrame: '1',
        isCache: '0',
        menuType: 'M',
        visible: '0',
        status: '0',
        icon: 'system',
      },
      {
        menuId: 101,
        parentId: 100,
        menuName: '用户管理',
        path: 'user',
        component: 'system/user/index',
        query: '',
        isFrame: '1',
        isCache: '0',
        menuType: 'C',
        visible: '0',
        status: '0',
        icon: 'user',
      },
    ]);

    await service.getMenuListByUserId(5);

    expect(userService.getRoleIds).toHaveBeenCalledWith([5]);
    expect(prisma.sysRoleMenu.findMany).toHaveBeenCalledWith({
      where: {
        roleId: {
          in: [2, 3],
        },
      },
      select: {
        menuId: true,
      },
    });
    expect(prisma.sysMenu.findMany).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
        status: '0',
        menuId: {
          in: [100, 101],
        },
      },
      orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
    });
  });
});
