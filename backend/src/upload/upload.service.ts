import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION') || 'ap-southeast-1';
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || 'thaitienshop-storage';

    const s3Config: any = { region };

    // Nếu có Key trong .env thì dùng, không thì để SDK tự tìm trong IAM Role
    if (accessKeyId && secretAccessKey) {
      s3Config.credentials = {
        accessKeyId,
        secretAccessKey,
      };
      console.log('✅ S3 initialized with Environment Credentials');
    } else {
      console.log('ℹ️ S3 initialized with IAM Role / Default Provider Chain');
    }

    this.s3Client = new S3Client(s3Config);
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Không có file để tải lên');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `products/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Đảm bảo Bucket cho phép public-read
      });

      await this.s3Client.send(command);

      // Trả về URL của file trên S3
      return `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('❌ S3 Upload Error:', error);
      throw new BadRequestException('Lỗi khi tải ảnh lên S3');
    }
  }
}
