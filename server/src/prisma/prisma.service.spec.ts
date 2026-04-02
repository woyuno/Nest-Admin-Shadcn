import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    const prismaService = moduleRef.get(PrismaService);

    expect(prismaService).toBeDefined();
    expect(typeof prismaService.$connect).toBe('function');
  });

  it('should connect on module init', async () => {
    const prismaService = new PrismaService();
    const connectSpy = jest.spyOn(prismaService, '$connect').mockResolvedValue();

    await prismaService.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('should register shutdown hook and close app on beforeExit', async () => {
    const prismaService = new PrismaService();
    const close = jest.fn().mockResolvedValue(undefined);
    const app = { close } as unknown as INestApplication;
    let shutdownHook: (() => Promise<void>) | undefined;
    const onSpy = jest.spyOn(prismaService, '$on').mockImplementation(((event, callback) => {
      if (event === ('beforeExit' as never)) {
        shutdownHook = callback as () => Promise<void>;
      }

      return prismaService;
    }) as typeof prismaService.$on);

    await prismaService.enableShutdownHooks(app);

    expect(onSpy).toHaveBeenCalledTimes(1);
    expect(onSpy).toHaveBeenCalledWith('beforeExit', expect.any(Function));
    expect(shutdownHook).toBeDefined();
    await shutdownHook?.();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
