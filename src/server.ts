import express from 'express';
import cors from 'cors';
import { extractPreviewData } from './utils';
const app = express();

app.use(cors());
app.use(express.json());

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

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }

    const html = await response.text();
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
    // console.log('Processing URL:', url);
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +http://www.yourwebsite.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0',
    };
   // console.log('Request headers:', headers);
    
    const response = await fetch(url, { headers });
    // console.log('Response headers:', Object.fromEntries(response.headers));
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    const html = await response.text();
    console.log('Received HTML length:', html.length);
    // console.log('First 1000 characters of HTML:', html.substring(0, 1000));
    const previewData = extractPreviewData(html, url);
    console.log('Extracted preview data:', previewData);
    res.json(previewData);
  } catch (error) {
    console.error('Failed to generate preview:', error);
    res.status(500).json({ 'Failed to generate preview': error });
  }
});