# Link Preview API 

## About 

This is v1 of a link preview API. 

The API takes a URL and returns the following link preview data:
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
    "title": "GitHub - corsodr/link-preview-api",
    "favicon": "https://github.githubassets.com/favicons/favicon.svg",
    "description": "Contribute to corsodr/link-preview-api development by creating an account on GitHub.",
    "image": "https://opengraph.githubassets.com/44643e8687367611f1afe4c53673569ae53731e40b5ae0dc55f6cf78cc6a8e86/corsodr/link-preview-api"
}
```

Note: This API is currently in development and not ready for production. 
