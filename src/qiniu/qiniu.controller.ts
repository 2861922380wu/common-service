import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QiniuService } from './qiniu.service';
import { GetUploadTokenDto, UploadFileDto, DeleteFileDto } from './dto/upload.dto';

@Controller('qiniu')
export class QiniuController {
  constructor(private readonly qiniuService: QiniuService) {}

  @Post('upload-token')
  @HttpCode(HttpStatus.OK)
  getUploadToken(@Body() dto: GetUploadTokenDto) {
    const token = this.qiniuService.getUploadToken(dto.bucket, dto.key, dto.expires);
    return {
      code: 200,
      message: '获取上传凭证成功',
      data: { token },
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() dto: UploadFileDto) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }
    const result = await this.qiniuService.uploadBuffer(file.buffer, dto.key, dto.bucket);
    return {
      code: 200,
      message: '文件上传成功',
      data: result,
    };
  }

  @Delete('files/:key')
  async deleteFile(@Param('key') key: string, @Body() dto: DeleteFileDto) {
    await this.qiniuService.deleteFile(key, dto.bucket);
    return {
      code: 200,
      message: '文件删除成功',
      data: null,
    };
  }

  @Get('files/:key')
  async getFileInfo(@Param('key') key: string, @Query('bucket') bucket?: string) {
    const info = await this.qiniuService.getFileInfo(key, bucket);
    return {
      code: 200,
      message: '获取文件信息成功',
      data: info,
    };
  }
}
