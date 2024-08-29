import express from 'express';
import cors from 'cors';
import { extractPreviewData } from './utils';
import * as fs from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const proxyConfig = {
  host: process.env.PROXY_HOST,
  auth: {
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  }
};

const getProxyAgent = (url: string) => {
  const isHttps = url.startsWith('https');
  const proxyPort = isHttps ? 443 : 80;
  return new HttpsProxyAgent(`http://${proxyConfig.auth.username}-session-${Date.now()}:${proxyConfig.auth.password}@${proxyConfig.host}:${proxyPort}`);
};

app.get('/', (req, res) => {
  res.send('This is a link preview API.');
});

app.get('/api/fullhtml', async (req, res) => {
  console.log('Received GET request to /api/fullhtml');
  try {
    const { url } = req.query;
    if (typeof url !== 'string') {
      return res.status(400).json({ error: 'URL must be a string' });
    }
    console.log('Processing URL:', url);
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +http://www.yourwebsite.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0',
    };

    const httpsAgent = getProxyAgent(url);
    const response = await axios.get(url, { headers, httpsAgent });

    if (response.status !== 200) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }

    const html = response.data;
    console.log('Received HTML length:', html.length);

    res.send(html); // Send the full HTML as the response
  } catch (error) {
    console.error('Failed to fetch HTML:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch HTML', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch HTML', details: 'An unknown error occurred' });
    }
  }
});

app.post('/api/preview', async (req, res) => {
  console.log('Received POST request to /api/preview');
  console.log('Request body:', req.body);
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +http://www.yourwebsite.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0',
    };

    const httpsAgent = getProxyAgent(url);
    const response = await axios.get(url, { headers, httpsAgent });

    if (response.status !== 200) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }

    const html = response.data;
    fs.writeFileSync('/tmp/response.html', html);

    console.log('Received HTML length:', html.length);

    const previewData = extractPreviewData(html, url);

    console.log('Extracted preview data:', previewData);
    res.json(previewData);
  } catch (error) {
    console.error('Failed to generate preview:', error);
    res.status(500).json({ 'Failed to generate preview': error });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;