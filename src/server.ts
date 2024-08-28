import express from 'express';
import cors from 'cors';
import { extractPreviewData } from './utils';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/preview', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    // update user agent info 
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
    const previewData = extractPreviewData(html, url);
    res.json(previewData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate preview',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;