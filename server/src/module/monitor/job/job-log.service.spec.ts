import { JobLogService } from './job-log.service';

describe('JobLogService', () => {
  const createService = () => {
    const prisma = {
      sysJobLog: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    return {
      service: new JobLogService(prisma as never),
      prisma,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should query job logs with filters, range and pagination', async () => {
    const { service, prisma } = createService();

    await service.list({
      pageNum: 3,
      pageSize: 10,
      jobName: '同步',
      jobGroup: 'SYSTEM',
      status: '1',
      params: {
        beginTime: '2026-04-01 00:00:00',
        endTime: '2026-04-02 23:59:59',
      },
    } as never);

    expect(prisma.sysJobLog.findMany).toHaveBeenCalledWith({
      where: {
        jobName: { contains: '同步' },
        jobGroup: 'SYSTEM',
        status: '1',
        createTime: {
          gte: new Date('2026-04-01 00:00:00'),
          lte: new Date('2026-04-02 23:59:59'),
        },
      },
      skip: 20,
      take: 10,
      orderBy: [{ createTime: 'desc' }],
    });
    expect(prisma.sysJobLog.count).toHaveBeenCalledWith({
      where: {
        jobName: { contains: '同步' },
        jobGroup: 'SYSTEM',
        status: '1',
        createTime: {
          gte: new Date('2026-04-01 00:00:00'),
          lte: new Date('2026-04-02 23:59:59'),
        },
      },
    });
  });
})
