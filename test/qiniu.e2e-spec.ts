import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { QiniuModule } from '../src/qiniu/qiniu.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../src/auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtGuard } from '../src/guard/jwt.guard';

describe('QiniuController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.example',
        }),
        ThrottlerModule.forRoot({
          throttlers: [{ ttl: 60000, limit: 60 }],
        }),
        AuthModule,
        QiniuModule,
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/qiniu/upload-token (POST)', () => {
    it('should return upload token', () => {
      return request(app.getHttpServer())
        .post('/qiniu/upload-token')
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.message).toBe('获取上传凭证成功');
          expect(res.body.data).toBeDefined();
          expect(res.body.data.token).toBeDefined();
        });
    });

    it('should return upload token with custom bucket', () => {
      return request(app.getHttpServer())
        .post('/qiniu/upload-token')
        .send({ bucket: 'test-bucket' })
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.token).toBeDefined();
        });
    });
  });

  describe('/qiniu/upload (POST)', () => {
    it('should return 400 when no file uploaded', async () => {
      const response = await request(app.getHttpServer()).post('/qiniu/upload');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('请上传文件');
    });
  });
});
