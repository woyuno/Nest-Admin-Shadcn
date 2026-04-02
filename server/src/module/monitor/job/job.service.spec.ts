import { SchedulerRegistry } from '@nestjs/schedule';
import { JobService } from './job.service';

describe('JobService', () => {
  const createService = () => {
    const prisma = {
      sysJob: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const schedulerRegistry = {
      addCronJob: jest.fn(),
      deleteCronJob: jest.fn(),
      getCronJob: jest.fn(),
    };
    const taskService = {
      executeTask: jest.fn(),
    };

    return {
      service: new JobService(schedulerRegistry as unknown as SchedulerRegistry, prisma as never, taskService as never),
      prisma,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should query job list with Prisma filters and pagination', async () => {
    const { service, prisma } = createService();
    prisma.sysJob.findMany.mockResolvedValueOnce([]);
    prisma.sysJob.count.mockResolvedValueOnce(0);

    await service.list({
      pageNum: 2,
      pageSize: 20,
      jobName: '同步',
      jobGroup: 'DEFAULT',
      status: '0',
    });

    expect(prisma.sysJob.findMany).toHaveBeenCalledWith({
      where: {
        jobName: { contains: '同步' },
        jobGroup: 'DEFAULT',
        status: '0',
      },
      skip: 20,
      take: 20,
      orderBy: {
        createTime: 'desc',
      },
    });
    expect(prisma.sysJob.count).toHaveBeenCalledWith({
      where: {
        jobName: { contains: '同步' },
        jobGroup: 'DEFAULT',
        status: '0',
      },
    });
  });
})
