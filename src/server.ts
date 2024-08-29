import express from 'express';
import cors from 'cors';
import { extractPreviewData } from './utils';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('This is a link preview API.');
});

app.post('/api/preview', async (req, res) => {
  console.log('Received POST request to /api/preview');
  console.log('Request body:', req.body);
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    console.log('Processing URL:', url);
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0',
    };

    console.log('Request headers:', headers);
    
    const response = await fetch(url, { headers });

    console.log('Response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }

    const html = await response.text();
    
    console.log('Received HTML length:', html.length);
    console.log('First 1000 characters of HTML:', html.substring(0, 100));

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

module.exports = app;