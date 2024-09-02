import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function uploadToS3(buffer: Buffer, mimeType: string): Promise<string> {
  const key = `${uuidv4()}.jpg`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read',
  };

  const data = await s3.upload(params).promise();
  return data.Location;
}