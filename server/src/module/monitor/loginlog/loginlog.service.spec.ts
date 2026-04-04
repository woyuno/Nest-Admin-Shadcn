import { LoginlogService } from './loginlog.service';

describe('LoginlogService', () => {
  const createService = () => {
    const prisma = {
      sysLogininfor: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const service = new LoginlogService(prisma as never);

    return { service, prisma };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should persist only prisma supported login log fields', async () => {
    const { service, prisma } = createService();
    prisma.sysLogininfor.create.mockResolvedValue({});

    await service.create({
      userAgent: 'Mozilla/5.0',
      ipaddr: '127.0.0.1',
      browser: 'Chrome',
      os: 'Windows',
      loginLocation: '北京',
      dateTime: '2026-04-03 01:40:31',
      userName: 'admin',
      status: '0',
      msg: '登录成功',
    } as never);

    expect(prisma.sysLogininfor.create).toHaveBeenCalledWith({
      data: {
        ipaddr: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows',
        loginLocation: '北京',
        loginTime: new Date('2026-04-03 01:40:31'),
        userName: 'admin',
        status: '0',
        msg: '登录成功',
      },
    });
  });

  it('should query login logs with filters sorting and pagination', async () => {
    const { service, prisma } = createService();
    prisma.sysLogininfor.findMany.mockResolvedValue([]);
    prisma.sysLogininfor.count.mockResolvedValue(0);

    await service.findAll({
      ipaddr: '127.0.0.1',
      userName: 'admin',
      status: '0',
      orderByColumn: 'loginTime',
      isAsc: 'descending',
      pageNum: 1,
      pageSize: 20,
      params: {
        beginTime: '2026-02-01 00:00:00',
        endTime: '2026-02-28 23:59:59',
      },
    } as never);

    expect(prisma.sysLogininfor.findMany).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
        ipaddr: { contains: '127.0.0.1' },
        userName: { contains: 'admin' },
        status: '0',
        loginTime: {
          gte: new Date('2026-02-01 00:00:00'),
          lte: new Date('2026-02-28 23:59:59'),
        },
      },
      orderBy: {
        loginTime: 'desc',
      },
      skip: 0,
      take: 20,
    });
    expect(prisma.sysLogininfor.count).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
        ipaddr: { contains: '127.0.0.1' },
        userName: { contains: 'admin' },
        status: '0',
        loginTime: {
          gte: new Date('2026-02-01 00:00:00'),
          lte: new Date('2026-02-28 23:59:59'),
        },
      },
    });
  });
});
