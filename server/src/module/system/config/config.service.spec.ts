import { CacheEnum } from 'src/common/enum';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  const createService = () => {
    const prisma = {
      sysConfig: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    const redisService = {
      set: jest.fn(),
    };

    const service = new ConfigService(prisma as never, redisService as never);

    return { service, prisma, redisService };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should query config list with keyword filters and pagination', async () => {
    const { service, prisma } = createService();
    prisma.sysConfig.findMany.mockResolvedValue([]);
    prisma.sysConfig.count.mockResolvedValue(0);

    await service.findAll({
      configName: '系统',
      configKey: 'site',
      configType: 'Y',
      pageNum: 2,
      pageSize: 10,
      params: {
        beginTime: '2026-01-01 00:00:00',
        endTime: '2026-01-31 23:59:59',
      },
    } as never);

    expect(prisma.sysConfig.findMany).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
        configName: { contains: '系统' },
        configKey: { contains: 'site' },
        configType: 'Y',
        createTime: {
          gte: new Date('2026-01-01 00:00:00'),
          lte: new Date('2026-01-31 23:59:59'),
        },
      },
      skip: 10,
      take: 10,
    });
    expect(prisma.sysConfig.count).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
        configName: { contains: '系统' },
        configKey: { contains: 'site' },
        configType: 'Y',
        createTime: {
          gte: new Date('2026-01-01 00:00:00'),
          lte: new Date('2026-01-31 23:59:59'),
        },
      },
    });
  });

  it('should warm config cache from active config records', async () => {
    const { service, prisma, redisService } = createService();
    prisma.sysConfig.findMany.mockResolvedValue([
      { configKey: 'site.name', configValue: 'Nest Admin' },
      { configKey: '', configValue: 'ignored' },
    ]);

    await service.loadingConfigCache();

    expect(prisma.sysConfig.findMany).toHaveBeenCalledWith({
      where: { delFlag: '0' },
    });
    expect(redisService.set).toHaveBeenCalledTimes(1);
    expect(redisService.set).toHaveBeenCalledWith(`${CacheEnum.SYS_CONFIG_KEY}site.name`, 'Nest Admin');
  });
});
