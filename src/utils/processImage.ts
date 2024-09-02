import sharp from 'sharp';

export async function processImage(imageUrl: string): Promise<{ buffer: Buffer, mimeType: string }> {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const processedBuffer = await sharp(buffer)
    .resize(1230, 630, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  // review mime type 
  return { buffer: processedBuffer, mimeType: 'image/jpeg' };
}