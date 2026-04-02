import { CacheEnum } from 'src/common/enum';
import { DictService } from './dict.service';

describe('DictService', () => {
  const createService = () => {
    const prisma = {
      sysDictType: {
        findMany: jest.fn(),
      },
      sysDictData: {
        findMany: jest.fn(),
      },
    };

    const redisService = {
      get: jest.fn(),
      set: jest.fn(),
      keys: jest.fn(),
      del: jest.fn(),
    };

    const legacyTypeRepo = {
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn(),
        leftJoinAndMapMany: jest.fn(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    const legacyDataRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const service =
      DictService.length >= 3
        ? new (DictService as any)(legacyTypeRepo, legacyDataRepo, redisService)
        : new (DictService as any)(prisma, redisService);

    return {
      service,
      prisma,
      redisService,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should warm dict cache from active types and related dict data via Prisma', async () => {
    const { service, prisma, redisService } = createService();
    prisma.sysDictType.findMany.mockResolvedValue([
      {
        dictType: 'sys_user_sex',
        dictData: [
          { dictCode: 1, dictLabel: '男' },
          { dictCode: 2, dictLabel: '女' },
        ],
      },
    ]);

    await service.loadingDictCache();

    expect(prisma.sysDictType.findMany).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
      },
      include: {
        dictData: {
          where: {
            delFlag: '0',
          },
          orderBy: {
            dictSort: 'asc',
          },
        },
      },
    });
    expect(redisService.set).toHaveBeenCalledWith(`${CacheEnum.SYS_DICT_KEY}sys_user_sex`, [
      { dictCode: 1, dictLabel: '男' },
      { dictCode: 2, dictLabel: '女' },
    ]);
  });
});
