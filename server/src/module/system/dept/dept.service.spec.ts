import { DataScopeEnum } from 'src/common/enum';
import { DeptService } from './dept.service';

describe('DeptService', () => {
  const createService = () => {
    const prisma = {
      sysDept: {
        findMany: jest.fn(),
      },
    };
    const redisService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const service = new (DeptService as any)(prisma);
    (service as any).redis = redisService;

    return {
      service,
      prisma,
      redisService,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve current and child dept ids with exact ancestor matching filters', async () => {
    const { service, prisma } = createService();
    prisma.sysDept.findMany.mockResolvedValue([{ deptId: 10 }, { deptId: 11 }]);

    const result = await service.findDeptIdsByDataScope(10, DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD);

    expect(prisma.sysDept.findMany).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
        OR: [
          { deptId: 10 },
          { ancestors: '10' },
          { ancestors: { startsWith: '10,' } },
          { ancestors: { endsWith: ',10' } },
          { ancestors: { contains: ',10,' } },
        ],
      },
      select: {
        deptId: true,
      },
      orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
    });
    expect(result).toEqual([10, 11]);
  });
});
