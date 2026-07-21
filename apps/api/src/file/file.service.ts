import { BadRequestException, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buffer } from 'node:stream/consumers';
import { randomUUID } from 'node:crypto';
import { Client as MinioClient } from 'minio';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FileService implements OnModuleInit {
  private readonly logger = new Logger(FileService.name);
  private readonly minioClient: MinioClient;
  private readonly bucket: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'word-order');
    this.minioClient = new MinioClient({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: Number(this.configService.get<number>('MINIO_PORT', 9000)),
      useSSL: this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket);
      }
    } catch (error) {
      this.logger.warn(`MinIO not ready yet: ${String(error)}`);
    }
  }

  async upload(ownerId: string, request: any) {
    const filePart = await request.file();
    if (!filePart) {
      throw new BadRequestException('请选择要上传的图片');
    }

    const fileBuffer = await buffer(filePart.file);
    if (!fileBuffer.length) {
      throw new BadRequestException('图片内容不能为空');
    }

    // 按文件头（magic bytes）校验真实类型，忽略客户端文件名后缀，防止伪装成图片上传恶意文件
    const extension = detectImageExtension(fileBuffer);
    if (!extension) {
      throw new BadRequestException('仅支持 PNG / JPEG / WebP / GIF 图片');
    }
    const storageKey = `${ownerId}/${randomUUID()}.${extension}`;

    try {
      await this.minioClient.putObject(
        this.bucket,
        storageKey,
        fileBuffer,
        fileBuffer.length,
        { 'Content-Type': filePart.mimetype || 'application/octet-stream' },
      );
      const url = await this.minioClient.presignedGetObject(this.bucket, storageKey, 60 * 60 * 24 * 7);
      const asset = await this.prismaService.fileAsset.create({
        data: {
          ownerId,
          storageKey,
          url,
          mimeType: filePart.mimetype || 'application/octet-stream',
          size: fileBuffer.length,
        },
      });

      return asset;
    } catch (error) {
      throw new InternalServerErrorException(`上传文件失败: ${String(error)}`);
    }
  }
}

/**
 * 依据文件头（magic bytes）判定图片类型，仅允许 PNG / JPEG / WebP / GIF。
 * 不信任客户端传入的文件名后缀或 mimetype，从根本上杜绝伪装图片上传恶意文件。
 */
function detectImageExtension(buf: Buffer): string | null {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'png';
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'jpg';
  }
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  if (buf.length >= 6 && buf.toString('ascii', 0, 3) === 'GIF' && buf[3] === 0x38) {
    return 'gif';
  }
  return null;
}
