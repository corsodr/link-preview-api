# Link Preview API 

## About 

This is v1 of a link preview API. 

The API takes a URL and returns the following link preview data:
- title
- favicon
- description 
- image 

It works by fetching the HTML for the provided URL, using Cheerio to parse the HTML, and extracting link preview data from metatags.


## Try it 
Send a POST request to: 
https://link-preview-api-v1.vercel.app/api/preview 

Request body:
```json
{
  "url": "https://example.com"
}

Response: 
{
  "title": "Example Domain",
  "favicon": "https://example.com/favicon.ico",
  "description": "This domain is for use in illustrative examples in documents.",
  "image": "https://example.com/image.jpg"
}

Note: This API is currently in development and not ready for production. 
