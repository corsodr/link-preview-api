import express from 'express';
import cors from 'cors';
import { extractPreviewData } from './utils';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Link Preview API is running. Send a POST request to /api/preview to use the API.');
});

app.post('/api/preview', async (req, res) => {
    try {
      console.log('Received request:', req.body);
      const { url } = req.body;
  
      if (!url) {
        console.log('Error: URL is required');
        return res.status(400).json({ error: 'URL is required' });
      }
  
      console.log(`Fetching URL: ${url}`);
      // check header 
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      console.log('Fetch response status:', response.status);
      
      const html = await response.text();
      console.log('HTML content length:', html.length);
  
      const previewData = extractPreviewData(html, url);
      console.log('Extracted preview data:', previewData);
  
      res.json(previewData);

    } catch (error) {
      console.error('Error generating preview:', error);
      res.status(500).json({ error: 'Failed to generate preview', details: error.message });
    }
  });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});