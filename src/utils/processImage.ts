import sharp from 'sharp';

export async function processImage(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return sharp(buffer)
    .resize(1230, 630, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
}
