# Link Preview API 

## About 

This is v1 of a link preview API. 

The API takes a URL and returns the following link preview data if it exists:
- url
- domain
- title
- favicon 
- description 
- image 

It fetches the HTML for the URL, parses the HTML, and extracts link preview data from metatags.


## Try it 
Send a POST request to: 
https://link-preview-api-v1.vercel.app/api/preview 

Request body:
```json
{
  "url": "https://github.com/corsodr/link-preview-api"
}
```

Response: 
```json 
{
    "url": "https://github.com/corsodr/link-preview-api",
    "domain": "github.com",
    "title": "GitHub - corsodr/link-preview-api",
    "favicon": "https://github.githubassets.com/favicons/favicon.svg",
    "description": "Contribute to corsodr/link-preview-api development by creating an account on GitHub.",
    "image": "https://opengraph.githubassets.com/7e75ad5d42119e3e30873493b49af8ffff7aea531c57241a3e82bc77b4608c79/corsodr/link-preview-api"
}
```

Note: This API is currently in development and not ready for production. 
