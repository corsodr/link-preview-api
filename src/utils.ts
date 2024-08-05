import * as cheerio from 'cheerio';
import { PreviewData } from './types';

export function extractPreviewData(html: string, url: string): PreviewData {
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

    const getImage = (): string => {
        const image = getMetatag('image') ||
                      $('link[rel="image_src"]').attr('href') ||
                      '';
        return image ? new URL(image, url).href : '';
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
        image: getImage(),
    };
}