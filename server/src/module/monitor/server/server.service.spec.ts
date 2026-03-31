import { ServerService } from './server.service';

describe('ServerService', () => {
  let service: ServerService;

  beforeEach(() => {
    service = new ServerService();
  });

  it('should parse Windows drive types into stable Chinese labels', () => {
    const output = [
      'Caption=C:',
      'DriveType=3',
      '',
      'Caption=G:',
      'DriveType=2',
      '',
      'Caption=Z:',
      'DriveType=4',
      '',
    ].join('\r\r\n');

    expect(service.parseWindowsDriveTypeOutput(output)).toEqual({
      'C:': '本地固定磁盘',
      'G:': '可移动磁盘',
      'Z:': '网络磁盘',
    });
  });

  it('should prefer mapped Windows drive types over garbled filesystem labels', () => {
    expect(
      service.resolveDiskTypeName({
        mounted: 'C:',
        rawTypeName: '���ع̶�����',
        windowsDriveTypes: {
          'C:': '本地固定磁盘',
        },
      }),
    ).toBe('本地固定磁盘');
  });
});
