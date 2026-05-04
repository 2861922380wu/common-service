import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUploadTokenDto {
  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsString()
  key?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(86400)
  expires?: number;
}

export class UploadFileDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  bucket?: string;
}

export class DeleteFileDto {
  @IsOptional()
  @IsString()
  bucket?: string;
}
