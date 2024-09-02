import * as cheerio from 'cheerio';
import { Preview } from '../types';
import { processImage } from './processImage';
import { uploadToS3 } from './uploadToS3';

export async function getPreviewData(html: string, url: string): Promise<Preview> {
    const $ = cheerio.load(html);

    const getMetatag = (name: string) => 
        $(`meta[name="${name}"]`).attr('content') ||
        $(`meta[property="og:${name}"]`).attr('content') ||
        $(`meta[property="twitter:${name}"]`).attr('content') ||
        '';

    const getFavicon = (): string => {
        const favicon = $('link[rel="shortcut icon"]').attr('href') ||
                        $('link[rel="icon"]').attr('href');
        return favicon ? new URL(favicon, url).href : '';
    }

    const getImage = async (): Promise<string> => {
        const image = getMetatag('image') ||
                      $('link[rel="image_src"]').attr('href') ||
                      '';
        if (image) {
        const imageUrl = new URL(image, url).href;
        const { buffer, mimeType } = await processImage(imageUrl);
        return await uploadToS3(buffer, mimeType);
        }
        return '';
    }

    const getDomain = (url: string): string => {
        const domain = new URL(url).hostname;
        return domain.startsWith('www.') ? domain.slice(4) : domain;
    }

    return {
        url,
        domain: getDomain(url),
        title: $('title').text() || '',
        favicon: getFavicon(),
        description: getMetatag('description'),
        image: await getImage(),
    };
}