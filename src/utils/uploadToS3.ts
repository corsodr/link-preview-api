import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3();

export async function uploadToS3(buffer: Buffer, mimeType: string): Promise<string> {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `${uuidv4()}`,
    Body: buffer,
    ContentType: mimeType,
  };

  const data = await s3.upload(params).promise();
  return data.Location;
}