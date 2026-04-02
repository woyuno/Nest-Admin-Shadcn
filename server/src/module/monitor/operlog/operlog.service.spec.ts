import { OperlogService } from './operlog.service';

describe('OperlogService', () => {
  const createService = () => {
    const request = {
      originalUrl: '/system/config',
      method: 'post',
      ip: '127.0.0.1',
      body: { configKey: 'site.name' },
      query: { traceId: 'trace-1' },
      user: {
        user: {
          nickName: '管理员',
          deptName: '研发部',
        },
      },
    };
    const prisma = {
      sysOperLog: {
        create: jest.fn(),
      },
    };
    const axiosService = {
      getIpAddress: jest.fn(),
    };
    const dictService = {};

    const service = new OperlogService(request as never, prisma as never, axiosService as never, dictService as never);

    return { service, prisma, axiosService };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should persist request scoped operation logs with prisma payload', async () => {
    const { service, prisma, axiosService } = createService();
    axiosService.getIpAddress.mockResolvedValue('内网IP');
    prisma.sysOperLog.create.mockResolvedValue({ operId: 1 });

    await service.logAction({
      resultData: { code: 200, msg: '成功' },
      costTime: 35,
      title: '参数管理',
      handlerName: 'ConfigController.update',
      businessType: 2,
    });

    expect(axiosService.getIpAddress).toHaveBeenCalledWith('127.0.0.1');
    expect(prisma.sysOperLog.create).toHaveBeenCalledWith({
      data: {
        title: '参数管理',
        method: 'ConfigController.update',
        operName: '管理员',
        deptName: '研发部',
        operUrl: '/system/config',
        requestMethod: 'POST',
        operIp: '127.0.0.1',
        costTime: 35,
        operLocation: '内网IP',
        operParam: JSON.stringify({ configKey: 'site.name', traceId: 'trace-1' }),
        jsonResult: JSON.stringify({ code: 200, msg: '成功' }),
        errorMsg: undefined,
        businessType: 2,
        operatorType: '1',
        operTime: expect.any(Date),
        status: '0',
      },
    });
  });
});
