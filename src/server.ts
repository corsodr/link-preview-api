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
      const { url } = req.body;
  
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
  
      const response = await fetch(url);
      const html = await response.text();
  
      const previewData = extractPreviewData(html, url);
  
      res.json(previewData);
    } catch (error) {
      console.error('Error generating preview:', error);
      res.status(500).json({ error: 'Failed to generate preview' });
    }
  });


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// where should I put this? 
export default app;