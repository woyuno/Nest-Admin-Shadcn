import { ResultData } from 'src/common/utils/result';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  const createService = () => {
    const prisma = {
      sysUpload: {
        create: jest.fn(),
      },
    };
    const config = {
      get: jest.fn((key: string) => {
        const values: Record<string, unknown> = {
          'cos.secretId': '',
          'cos.secretKey': '',
          'app.file.isLocal': true,
          'app.file.maxSize': 10,
        };

        return values[key];
      }),
    };

    const service = new UploadService(prisma as never, config as never);

    return { service, prisma };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject files larger than configured max size before persisting upload record', async () => {
    const { service, prisma } = createService();

    const result = await service.singleFileUpload({
      size: 11 * 1024 * 1024,
    } as Express.Multer.File);

    expect(result).toEqual(ResultData.fail(500, '文件大小不能超过10MB'));
    expect(prisma.sysUpload.create).not.toHaveBeenCalled();
  });

  it('should persist upload record after local upload succeeds', async () => {
    const { service, prisma } = createService();
    jest.spyOn(service, 'saveFileLocal').mockResolvedValue({
      fileName: '/profile/avatar.png',
      newFileName: 'avatar_1.png',
      url: 'http://localhost:8080/profile/avatar.png',
    });
    prisma.sysUpload.create.mockResolvedValue({ uploadId: 'uuid-1' });

    const file = {
      size: 1024,
      originalname: 'avatar.png',
      mimetype: 'image/png',
    } as Express.Multer.File;

    const result = await service.singleFileUpload(file);

    expect(service.saveFileLocal).toHaveBeenCalledWith(file);
    expect(prisma.sysUpload.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fileName: '/profile/avatar.png',
        newFileName: 'avatar_1.png',
        url: 'http://localhost:8080/profile/avatar.png',
        ext: '.png',
        size: 1024,
      }),
    });
    expect(result).toEqual({
      fileName: '/profile/avatar.png',
      newFileName: 'avatar_1.png',
      url: 'http://localhost:8080/profile/avatar.png',
    });
  });
});
