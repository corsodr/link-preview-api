import express from 'express';
import cors from 'cors';
import path from 'path';
import { extractPreviewData } from './utils';
import robotsParser from 'robots-parser';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function logAllHeaders(headers: Record<string, string>) {
  logWithTimestamp('All request headers:');
  Object.entries(headers).forEach(([key, value]) => {
    logWithTimestamp(`${key}: ${value}`);
  });
}

const logWithTimestamp = (message: string) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

app.use((req, res, next) => {
  logWithTimestamp(`Received ${req.method} request to ${req.originalUrl}`);
  next();
});

const checkRobotsTxt = async (url: string): Promise<boolean> => {
  try {
    const { protocol, host } = new URL(url);
    const robotsTxtUrl = `${protocol}//${host}/robots.txt`;
    logWithTimestamp(`Fetching robots.txt from: ${robotsTxtUrl}`);
    const response = await fetch(robotsTxtUrl);
    logWithTimestamp(`Robots.txt response status: ${response.status}`);
    logWithTimestamp(`Robots.txt response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    const robotsTxt = await response.text();
    logWithTimestamp(`Robots.txt content: ${robotsTxt.substring(0, 200)}...`);
    const robots = robotsParser(robotsTxtUrl, robotsTxt);
    const isAllowed = robots.isAllowed(url, 'LinkPreviewBot') ?? true;
    logWithTimestamp(`Is ${url} allowed by robots.txt? ${isAllowed}`);
    return isAllowed;
  } catch (error) {
    logWithTimestamp(`Error checking robots.txt: ${error}`);
    if (error instanceof Error) {
      logWithTimestamp(`Error name: ${error.name}, message: ${error.message}`);
    }
    return true;
  }
};

app.post('/api/preview', async (req, res) => {
  logWithTimestamp('Received POST request to /api/preview');
  logWithTimestamp(`Request body: ${JSON.stringify(req.body)}`);

  try {
    const { url } = req.body;

    if (!url) {
      logWithTimestamp('Error: URL is required');
      return res.status(400).json({ error: 'URL is required' });
    }

    logWithTimestamp(`Processing URL: ${url}`);

    const isAllowed = await checkRobotsTxt(url);
    if (!isAllowed) {
      logWithTimestamp(`Access to ${url} is not allowed by robots.txt`);
      return res.status(403).json({ error: 'Access to this URL is not allowed by robots.txt' });
    }

    const headers = {
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


    logWithTimestamp('Logging request headers before fetch:');
    logAllHeaders(headers);
    
    logWithTimestamp(`Fetching URL with headers: ${JSON.stringify(headers)}`);
    const response = await fetch(url, { headers });

    logWithTimestamp(`Response status: ${response.status}`);
    logWithTimestamp(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);

    if (!response.ok) {
      logWithTimestamp(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    logWithTimestamp(`Received HTML content (first 1000 chars): ${html.substring(0, 1000)}`);

    const previewData = extractPreviewData(html, url);
    logWithTimestamp(`Extracted preview data: ${JSON.stringify(previewData)}`);

    // Log the outgoing IP address
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    logWithTimestamp(`Outgoing IP address: ${ipData.ip}`);

    // Log Node.js version
    logWithTimestamp(`Node.js version: ${process.version}`);

    // Log key dependency versions
    try {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const { dependencies } = require(packageJsonPath);
      logWithTimestamp(`Key dependencies: ${JSON.stringify(dependencies)}`);
    } catch (error) {
      logWithTimestamp(`Error loading package.json: ${error}`);
    }

    res.json(previewData);

  } catch (error) {
    logWithTimestamp(`Error generating preview: ${error}`);
    if (error instanceof Error) {
      logWithTimestamp(`Error name: ${error.name}, message: ${error.message}`);
    }
    res.status(500).json({ 
      error: 'Failed to generate preview', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

app.use('*', (req, res) => {
  logWithTimestamp(`Received ${req.method} request to ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
  logWithTimestamp(`Server running on port ${port}`);
});