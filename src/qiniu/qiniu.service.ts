import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as qiniu from 'qiniu';

@Injectable()
export class QiniuService {
  private mac: qiniu.auth.digest.Mac;
  private config: qiniu.conf.Config;
  private bucketManager: qiniu.rs.BucketManager;
  private defaultBucket: string;
  private domain: string;

  constructor(private configService: ConfigService) {
    const accessKey = this.configService.get<string>('QINIU_ACCESS_KEY');
    const secretKey = this.configService.get<string>('QINIU_SECRET_KEY');
    this.defaultBucket = this.configService.get<string>('QINIU_BUCKET');
    this.domain = this.configService.get<string>('QINIU_DOMAIN');

    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    this.config = new qiniu.conf.Config();

    const zone = this.configService.get<string>('QINIU_ZONE', 'z2');
    this.config.zone = this.getZone(zone);

    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
  }

  private getZone(zone: string): qiniu.conf.Zone {
    const zoneMap: Record<string, qiniu.conf.Zone> = {
      z0: qiniu.zone.Zone_z0,
      z1: qiniu.zone.Zone_z1,
      z2: qiniu.zone.Zone_z2,
      na0: qiniu.zone.Zone_na0,
      as0: qiniu.zone.Zone_as0,
    };
    return zoneMap[zone] || qiniu.zone.Zone_z2;
  }

  getUploadToken(bucket?: string, key?: string, expires = 3600): string {
    const scope = bucket || this.defaultBucket;
    const options: qiniu.rs.PutPolicyOptions = {
      scope: key ? `${scope}:${key}` : scope,
      expires,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(this.mac);
  }

  async uploadFile(
    localFile: string,
    key?: string,
    bucket?: string,
  ): Promise<{ key: string; hash: string; url: string }> {
    const uploadToken = this.getUploadToken(bucket, key);
    const formUploader = new qiniu.form_up.FormUploader(this.config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.putFile(
        uploadToken,
        key || undefined,
        localFile,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(new InternalServerErrorException('文件上传失败'));
          } else if (respInfo.statusCode === 200) {
            resolve({
              key: respBody.key,
              hash: respBody.hash,
              url: `${this.domain}/${respBody.key}`,
            });
          } else {
            reject(
              new InternalServerErrorException(`文件上传失败: ${respBody?.error || '未知错误'}`),
            );
          }
        },
      );
    });
  }

  async uploadBuffer(
    buffer: Buffer,
    key?: string,
    bucket?: string,
  ): Promise<{ key: string; hash: string; url: string }> {
    const uploadToken = this.getUploadToken(bucket, key);
    const formUploader = new qiniu.form_up.FormUploader(this.config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.put(
        uploadToken,
        key || undefined,
        buffer,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(new InternalServerErrorException('文件上传失败'));
          } else if (respInfo.statusCode === 200) {
            resolve({
              key: respBody.key,
              hash: respBody.hash,
              url: `${this.domain}/${respBody.key}`,
            });
          } else {
            reject(
              new InternalServerErrorException(`文件上传失败: ${respBody?.error || '未知错误'}`),
            );
          }
        },
      );
    });
  }

  async deleteFile(key: string, bucket?: string): Promise<void> {
    const bucketName = bucket || this.defaultBucket;

    return new Promise((resolve, reject) => {
      this.bucketManager.delete(bucketName, key, (err, respBody, respInfo) => {
        if (err) {
          reject(new InternalServerErrorException('文件删除失败'));
        } else if (respInfo.statusCode === 200) {
          resolve();
        } else {
          reject(
            new InternalServerErrorException(`文件删除失败: ${respBody?.error || '未知错误'}`),
          );
        }
      });
    });
  }

  async getFileInfo(key: string, bucket?: string): Promise<any> {
    const bucketName = bucket || this.defaultBucket;

    return new Promise((resolve, reject) => {
      this.bucketManager.stat(bucketName, key, (err, respBody, respInfo) => {
        if (err) {
          reject(new InternalServerErrorException('获取文件信息失败'));
        } else if (respInfo.statusCode === 200) {
          resolve(respBody);
        } else {
          reject(
            new InternalServerErrorException(`获取文件信息失败: ${respBody?.error || '未知错误'}`),
          );
        }
      });
    });
  }
}
