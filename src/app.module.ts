import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { QiniuModule } from './qiniu/qiniu.module';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './guard/jwt.guard';

const envFilePath = [`.env.${process.env.NODE_ENV || `development`}`, '.env'];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
        PORT: Joi.number().default(3000),
        CORS_ORIGINS: Joi.string().optional(),
        JWT_SECRET: Joi.string().min(32).required(),
        QINIU_ACCESS_KEY: Joi.string().required(),
        QINIU_SECRET_KEY: Joi.string().required(),
        QINIU_BUCKET: Joi.string().required(),
        QINIU_DOMAIN: Joi.string().required(),
        QINIU_ZONE: Joi.string().valid('z0', 'z1', 'z2', 'na0', 'as0').default('z2'),
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 60,
        },
      ],
    }),
    AuthModule,
    QiniuModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
