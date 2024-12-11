import { Injectable } from '@nestjs/common';
import { UploadFileServiceAbstract } from './upload-file.abstract.service';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadFileServiceS3 implements UploadFileServiceAbstract {
  private readonly s3_client: S3Client;
  constructor(private readonly configService: ConfigService) {
    this.s3_client = new S3Client({
      region: this.configService.get<string>('aws_region'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws_access_key_id'),
        secretAccessKey: this.configService.get<string>(
          'aws_secret_access_key',
        ),
      },
    });
  }
  async uploadFileToPublicBucket(
    path: string,
    { file, file_name }: { file: Express.Multer.File; file_name: string },
  ) {
    const bucket_name = this.configService.get<string>('aws_bucket_name');
    const key = `${path}/${Date.now().toString()}-${file_name}`;
    await this.s3_client.send(
      new PutObjectCommand({
        Bucket: bucket_name,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        ContentLength: file.size,
      }),
    );
    return {
      url: `https://${bucket_name}.s3.amazonaws.com/${key}`,
      key: key,
    };
  }
}
