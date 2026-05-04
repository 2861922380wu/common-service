import { Test, TestingModule } from '@nestjs/testing';
import { QiniuService } from './qiniu.service';
import { ConfigService } from '@nestjs/config';

describe('QiniuService', () => {
  let service: QiniuService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        QINIU_ACCESS_KEY: 'mock_access_key',
        QINIU_SECRET_KEY: 'mock_secret_key',
        QINIU_BUCKET: 'mock_bucket',
        QINIU_DOMAIN: 'https://mock-domain.com',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QiniuService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<QiniuService>(QiniuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUploadToken', () => {
    it('should return upload token', () => {
      const token = service.getUploadToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should return upload token with custom bucket', () => {
      const token = service.getUploadToken('custom-bucket');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should return upload token with custom key and expires', () => {
      const token = service.getUploadToken('custom-bucket', 'custom-key', 7200);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });
});
