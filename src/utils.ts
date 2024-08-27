import * as cheerio from 'cheerio';
import { Preview } from './types';

export function extractPreviewData(html: string, url: string): Preview {
    const $ = cheerio.load(html);

    const getMetatag = (name: string) => {
        return $(`meta[name="${name}"]`).attr('content') ||
               $(`meta[property="og:${name}"]`).attr('content') ||
               $(`meta[property="twitter:${name}"]`).attr('content') ||
               '';
    }

    const getFavicon = (): string => {
        const favicon = $('link[rel="shortcut icon"]').attr('href') ||
                        $('link[rel="icon"]').attr('href');
        return favicon ? new URL(favicon, url).href : '';
    }

    const getImage = (): string => {
        const image = getMetatag('image') ||
                      $('link[rel="image_src"]').attr('href') ||
                      $('img[id="img"]').attr('src') ||  // YouTube-specific
                      '';
        return image ? new URL(image, url).href : '';
    }

    const getDomain = (url: string): string => {
        const domain = new URL(url).hostname;
        return domain.startsWith('www.') ? domain.slice(4) : domain;
    }

    const title = $('title').text() || getMetatag('title') || '';
    const description = getMetatag('description') || $('meta[name="description"]').attr('content') || '';

    // YouTube-specific checks
    const isYouTubeVideoPage = $('#watch7-content').length > 0 || $('meta[property="og:site_name"][content="YouTube"]').length > 0;

    if (!isYouTubeVideoPage) {
        console.warn('This does not appear to be a YouTube video page. Page structure may be unexpected.');
    }

    return {
        url,
        domain: getDomain(url),
        title,
        favicon: getFavicon(),
        description,
        image: getImage(),
        isYouTubeVideoPage
    };
}