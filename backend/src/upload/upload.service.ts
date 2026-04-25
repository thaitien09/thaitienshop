import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    // Cấu hình AWS S3
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') as string,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') as string,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file để upload');
    }

    return this.uploadToS3(file);
  }

  private async uploadToS3(file: Express.Multer.File): Promise<string> {
    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
    const region = this.configService.get('AWS_REGION');
    
    // Tạo tên file duy nhất trong folder products/
    const fileKey = `products/${uuidv4()}${extname(file.originalname)}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read', // Tùy vào cấu hình Bucket của bạn, có thể cần dòng này
    });

    try {
      await this.s3Client.send(command);
      // Trả về link URL của ảnh trên S3
      return `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new BadRequestException('Lỗi khi upload ảnh lên AWS S3');
    }
  }
}
