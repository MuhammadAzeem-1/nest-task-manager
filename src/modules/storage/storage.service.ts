import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string | null = null;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    this.initializeS3();
  }

  private initializeS3() {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const region = this.configService.get<string>('AWS_REGION');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');

    // Check if all required credentials are present
    if (accessKeyId && secretAccessKey && region && this.bucketName) {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.isConfigured = true;
      this.logger.log('S3 client initialized successfully');
    } else {
      this.logger.warn(
        'S3 credentials not configured. File upload will not work until credentials are added.',
      );
    }
  }

  /**
   * Upload a file to S3
   * @param file - The file buffer to upload
   * @param fileName - The name/key for the file in S3
   * @param mimeType - The MIME type of the file
   * @returns The public URL of the uploaded file or error message
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new BadRequestException(
        'S3 bucket needs to be setup. Please configure AWS credentials in environment variables.',
      );
    }

    try {
      const key = `profile-pictures/${Date.now()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName!,
        Key: key,
        Body: file,
        ContentType: mimeType,
        // Make the file publicly readable
        // ACL: 'public-read', // Note: ACL might be disabled on some buckets due to Block Public Access settings
      });

      await this.s3Client!.send(command);

      // Construct the public URL
      const region = this.configService.get<string>('AWS_REGION');
      const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error}`);
      throw new BadRequestException(
        'Failed to upload file. Please try again.',
      );
    }
  }

  /**
   * Delete a file from S3
   * @param fileUrl - The full URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn('S3 not configured, skipping file deletion');
      return;
    }

    try {
      // Extract the key from the URL
      const url = new URL(fileUrl);
      const key = url.pathname.substring(1); // Remove leading slash

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName!,
        Key: key,
      });

      await this.s3Client!.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3: ${error}`);
      // Don't throw error, just log it
    }
  }

  /**
   * Check if S3 is properly configured
   */
  isS3Configured(): boolean {
    return this.isConfigured;
  }
}

