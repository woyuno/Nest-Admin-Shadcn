import { NoticeService } from './notice.service';

describe('NoticeService', () => {
  const createService = () => {
    const prisma = {
      sysNotice: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const service = new NoticeService(prisma as never);

    return { service, prisma };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should query notice list with filters and pagination', async () => {
    const { service, prisma } = createService();
    prisma.sysNotice.findMany.mockResolvedValue([]);
    prisma.sysNotice.count.mockResolvedValue(0);

    await service.findAll({
      noticeTitle: '系统',
      createBy: 'admin',
      noticeType: '1',
      pageNum: 2,
      pageSize: 10,
      params: {
        beginTime: '2026-03-01 00:00:00',
        endTime: '2026-03-31 23:59:59',
      },
    } as never);

    expect(prisma.sysNotice.findMany).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
        noticeTitle: { contains: '系统' },
        createBy: { contains: 'admin' },
        noticeType: '1',
        createTime: {
          gte: new Date('2026-03-01 00:00:00'),
          lte: new Date('2026-03-31 23:59:59'),
        },
      },
      skip: 10,
      take: 10,
    });
    expect(prisma.sysNotice.count).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
        noticeTitle: { contains: '系统' },
        createBy: { contains: 'admin' },
        noticeType: '1',
        createTime: {
          gte: new Date('2026-03-01 00:00:00'),
          lte: new Date('2026-03-31 23:59:59'),
        },
      },
    });
  });

  it('should omit pagination when page params are absent', async () => {
    const { service, prisma } = createService();
    prisma.sysNotice.findMany.mockResolvedValue([]);
    prisma.sysNotice.count.mockResolvedValue(0);

    await service.findAll({
      noticeTitle: '公告',
    } as never);

    expect(prisma.sysNotice.findMany).toHaveBeenCalledWith({
      where: {
        delFlag: '0',
        noticeTitle: { contains: '公告' },
      },
    });
  });
});
