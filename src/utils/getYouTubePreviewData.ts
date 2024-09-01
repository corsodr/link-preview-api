import { google } from 'googleapis';
import { Preview } from '../types';
import dotenv from 'dotenv';

dotenv.config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

export async function getYouTubePreviewData(url: string): Promise<Preview | null> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      id: [videoId]
    });

    if (response.data.items && response.data.items.length > 0) {
      const video = response.data.items[0];
      const snippet = video.snippet!;
      const thumbnails = snippet.thumbnails || {};
      
      const image = thumbnails.maxres?.url || 
                    thumbnails.standard?.url || 
                    thumbnails.high?.url || 
                    thumbnails.medium?.url || 
                    thumbnails.default?.url || 
                    '';

      return {
        url,
        domain: 'youtube.com',
        title: snippet.title || '',
        favicon: 'https://www.youtube.com/favicon.ico',
        description: snippet.description || '',
        image,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return null;
  }
}

export function isYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}