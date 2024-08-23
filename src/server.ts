import express from 'express';
import cors from 'cors';
import { extractPreviewData } from './utils';


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// review this 
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.send('Link Preview API is running. Send a POST request to /api/preview to use the API.');
});

// debugging 
app.get('/debug', (req, res) => {
  res.json({
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
});

app.post('/api/preview', async (req, res) => {
    try {
      const { url } = req.body;
  
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      
      // review this 
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const html = await response.text();
  
      const previewData = extractPreviewData(html, url);
  
      res.json(previewData);

    // debugging 
    } catch (error) {
      console.error('Error generating preview:', error);
      console.error('URL:', req.body.url);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      res.status(500).json({ error: 'Failed to generate preview', details: error.message });
    }
  });


  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });