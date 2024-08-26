import express from 'express';
import cors from 'cors';
import { extractPreviewData } from './utils';
import robotsParser from 'robots-parser';

const app = express();
const port = process.env.PORT || 3000;

// review this if it works 
const corsOptions = {
  origin: '*', // Be more specific in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

const checkRobotsTxt = async (url: string): Promise<boolean> => {
  try {
    const { protocol, host } = new URL(url);
    const robotsTxtUrl = `${protocol}//${host}/robots.txt`;
    const response = await fetch(robotsTxtUrl);
    const robotsTxt = await response.text();
    const robots = robotsParser(robotsTxtUrl, robotsTxt);
    return robots.isAllowed(url, 'LinkPreviewBot') ?? true;
  } catch (error) {
    console.error('Error checking robots.txt:', error);
    return true;  // if we can't check robots.txt, assume it's allowed
  }
};

app.post('/api/preview', async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const { url } = req.body;

    if (!url) {
      console.log('Error: URL is required');
      return res.status(400).json({ error: 'URL is required' });
    }

    const isAllowed = await checkRobotsTxt(url);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access to this URL is not allowed by robots.txt' });
    }

    const headers = {
      // update url 
      'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +http://www.yourwebsite.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const previewData = extractPreviewData(html, url);

    res.json(previewData);

  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ 
      error: 'Failed to generate preview', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});