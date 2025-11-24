# AWS S3 Setup Guide for Profile Pictures

## Current Status
✅ All S3 integration code is implemented and ready
❌ AWS credentials not configured (profile picture uploads will show error message)

## Quick Setup

### 1. Add to your `.env` file:
```env
# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME=""
```

### 2. When Ready to Enable S3:

#### Option A: Create AWS S3 Bucket (Recommended for Production)

1. **Create S3 Bucket:**
   ```
   - Login to AWS Console (https://console.aws.amazon.com/)
   - Go to S3 service
   - Click "Create bucket"
   - Enter bucket name (e.g., "my-app-profile-pictures")
   - Choose region (e.g., "us-east-1")
   - Keep other settings as default
   - Click "Create bucket"
   ```

2. **Configure Bucket CORS (if needed):**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Create IAM User:**
   ```
   - Go to IAM service
   - Click "Users" → "Create user"
   - Username: "app-s3-uploader"
   - Click "Next"
   - Attach policies directly:
     * AmazonS3FullAccess (or create custom policy with limited permissions)
   - Click "Next" → "Create user"
   ```

4. **Create Access Keys:**
   ```
   - Click on the created user
   - Go to "Security credentials" tab
   - Scroll to "Access keys"
   - Click "Create access key"
   - Choose "Application running on AWS compute service" or "Local code"
   - Copy Access Key ID and Secret Access Key
   ```

5. **Update .env:**
   ```env
   AWS_ACCESS_KEY_ID="your-access-key-id-here"
   AWS_SECRET_ACCESS_KEY="your-secret-access-key-here"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET_NAME="my-app-profile-pictures"
   ```

6. **Restart Backend:**
   ```bash
   npm run start:dev
   ```

#### Option B: Use LocalStack (for Local Development)

If you want to test S3 locally without AWS:

1. **Install LocalStack:**
   ```bash
   pip install localstack
   # or
   docker run -d -p 4566:4566 localstack/localstack
   ```

2. **Configure .env for LocalStack:**
   ```env
   AWS_ACCESS_KEY_ID="test"
   AWS_SECRET_ACCESS_KEY="test"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET_NAME="profile-pictures"
   AWS_ENDPOINT="http://localhost:4566"  # Add this for LocalStack
   ```

3. **Update StorageService (if using LocalStack):**
   - Add `endpoint` configuration in `storage.service.ts` for local development

## Bucket Policy Example (Optional)

If you want public read access for profile pictures:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/profile-pictures/*"
    }
  ]
}
```

## Custom IAM Policy (Least Privilege)

Instead of `AmazonS3FullAccess`, you can create a custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/profile-pictures/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
    }
  ]
}
```

## Testing

### 1. Without S3 Credentials (Current):
```
POST /users/:id/profile-picture
→ Returns error: "S3 bucket needs to be setup"
```

### 2. With S3 Credentials:
```
POST /users/:id/profile-picture
→ Uploads to S3
→ Returns user object with profilePicture URL
```

## Troubleshooting

### Error: "S3 bucket needs to be setup"
- ✅ Expected behavior when credentials are not configured
- Add credentials to enable uploads

### Error: "Access Denied"
- Check IAM user has correct permissions
- Verify bucket policy allows uploads

### Error: "Invalid credentials"
- Double-check Access Key ID and Secret Access Key
- Ensure no extra spaces in .env file

### Error: "Bucket does not exist"
- Verify bucket name is correct
- Check region matches bucket region

## Cost Estimate (AWS)

- **S3 Storage:** ~$0.023 per GB/month
- **S3 Requests:** ~$0.005 per 1,000 PUT requests
- **Data Transfer:** First 100GB/month free

**Example:**
- 1,000 users with 500KB profile pictures each
- Storage: ~0.5GB = ~$0.01/month
- Very affordable for small to medium apps!

## Security Best Practices

1. ✅ Never commit `.env` file to Git
2. ✅ Use IAM policies with least privilege
3. ✅ Enable bucket versioning for backups
4. ✅ Use CloudFront CDN for better performance
5. ✅ Set up bucket lifecycle rules to delete old files
6. ✅ Enable server-side encryption

## Alternative Storage Options

If you don't want to use AWS S3, you can easily modify the `StorageService` to use:
- **DigitalOcean Spaces** (S3-compatible)
- **Backblaze B2** (S3-compatible)
- **Cloudinary** (image-specific service)
- **Local filesystem** (for development only)

All S3-compatible services work with the same AWS SDK code!

---

**Ready to add credentials and test? Just update your `.env` file and restart the backend!**

