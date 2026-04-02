import { DataScopeEnum } from 'src/common/enum';
import { UserService } from './user.service';

describe('UserService', () => {
  const createService = () => {
    const prisma = {
      sysUser: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      sysUserRole: {
        findMany: jest.fn(),
      },
      sysUserPost: {
        findMany: jest.fn(),
      },
    };

    const legacyUserRepo = {
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn(),
        leftJoinAndMapOne: jest.fn(),
        getOne: jest.fn().mockResolvedValue({
          userId: 1,
          deptId: 10,
        }),
      })),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
    };
    const legacyDeptRepo = {
      findOne: jest.fn(),
    };
    const legacyPostRepo = {
      find: jest.fn().mockResolvedValue([]),
    };
    const legacyUserPostRepo = {
      find: jest.fn().mockResolvedValue([]),
    };
    const legacyUserRoleRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const roleService = {
      findRoles: jest.fn().mockResolvedValue([]),
      getPermissionsByRoleIds: jest.fn().mockResolvedValue([]),
      findRoleWithDeptIds: jest.fn().mockResolvedValue([]),
    };
    const deptService = {
      findDeptIdsByDataScope: jest.fn().mockResolvedValue([10, 11]),
    };
    const jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };
    const redisService = {
      get: jest.fn(),
      set: jest.fn(),
      keys: jest.fn(),
      del: jest.fn(),
    };
    const configService = {
      get: jest.fn(),
    };

    const service =
      UserService.length >= 10
        ? new (UserService as any)(
            legacyUserRepo,
            legacyDeptRepo,
            legacyPostRepo,
            legacyUserPostRepo,
            legacyUserRoleRepo,
            roleService,
            deptService,
            jwtService,
            redisService,
            configService,
          )
        : new (UserService as any)(prisma, roleService, deptService, jwtService, redisService, configService);

    return {
      service,
      prisma,
      roleService,
      deptService,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load active user info with dept roles and posts through Prisma relations', async () => {
    const { service, prisma } = createService();
    prisma.sysUser.findUnique.mockResolvedValue({
      userId: 1,
      userName: 'admin',
      deptId: 10,
      delFlag: '0',
      dept: { deptId: 10, deptName: '研发部' },
      roleBindings: [{ role: { roleId: 1, roleKey: 'admin', status: '0', delFlag: '0' } }],
      postBindings: [{ post: { postId: 1, postName: '管理员', delFlag: '0' } }],
    });

    const result = await service.getUserinfo(1);

    expect(prisma.sysUser.findUnique).toHaveBeenCalledWith({
      where: {
        userId: 1,
      },
      include: {
        dept: true,
        roleBindings: {
          include: {
            role: true,
          },
        },
        postBindings: {
          include: {
            post: true,
          },
        },
      },
    });
    expect(result).toEqual(
      expect.objectContaining({
        userId: 1,
        userName: 'admin',
        dept: expect.objectContaining({ deptName: '研发部' }),
        roles: [expect.objectContaining({ roleKey: 'admin' })],
        posts: [expect.objectContaining({ postName: '管理员' })],
      }),
    );
  });

  it('should query paged users with dept scope filters via Prisma', async () => {
    const { service, prisma, deptService } = createService();
    prisma.sysUser.findMany.mockResolvedValue([]);
    prisma.sysUser.count.mockResolvedValue(0);

    await service.findAll(
      {
        deptId: '10',
        userName: 'adm',
        phonenumber: '138',
        status: '0',
        pageNum: 2,
        pageSize: 5,
        params: {
          beginTime: '2026-03-01 00:00:00',
          endTime: '2026-03-31 23:59:59',
        },
      } as never,
      {
        userId: 88,
        deptId: 8,
        roles: [
          {
            roleId: 2,
            dataScope: DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD,
          },
        ],
      } as never,
    );

    expect(deptService.findDeptIdsByDataScope).toHaveBeenNthCalledWith(1, 8, DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD);
    expect(deptService.findDeptIdsByDataScope).toHaveBeenNthCalledWith(2, 10, DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD);
    expect(prisma.sysUser.findMany).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
        deptId: {
          in: [10, 11],
        },
        userName: {
          contains: 'adm',
        },
        phonenumber: {
          contains: '138',
        },
        status: '0',
        createTime: {
          gte: new Date('2026-03-01 00:00:00'),
          lte: new Date('2026-03-31 23:59:59'),
        },
      },
      include: {
        dept: true,
      },
      skip: 5,
      take: 5,
      orderBy: [{ deptId: 'asc' }, { userId: 'asc' }],
    });
    expect(prisma.sysUser.count).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
        deptId: {
          in: [10, 11],
        },
        userName: {
          contains: 'adm',
        },
        phonenumber: {
          contains: '138',
        },
        status: '0',
        createTime: {
          gte: new Date('2026-03-01 00:00:00'),
          lte: new Date('2026-03-31 23:59:59'),
        },
      },
    });
  });
});
