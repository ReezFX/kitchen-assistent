// Save this as verify_image.js
const https = require('https');
const http = require('http');
const fs = require('fs');

async function testImageApiAndDownload() {
  console.log('Testing image API endpoint...');
  
  // Step 1: Get the image URL from the API
  const apiOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/recipes/1/image',
    method: 'GET'
  };
  
  const apiRequest = http.request(apiOptions, (apiRes) => {
    console.log(`API Response Status: ${apiRes.statusCode}`);
    
    let apiData = '';
    apiRes.on('data', (chunk) => {
      apiData += chunk;
    });
    
    apiRes.on('end', () => {
      try {
        const jsonResponse = JSON.parse(apiData);
        console.log('API Response:', jsonResponse);
        
        if (jsonResponse.image_url) {
          console.log(`Image URL: http://localhost:5000${jsonResponse.image_url}`);
          
          // Step 2: Download the actual image
          const imageOptions = {
            hostname: 'localhost',
            port: 5000,
            path: jsonResponse.image_url,
            method: 'GET'
          };
          
          const imageRequest = http.request(imageOptions, (imageRes) => {
            console.log(`Image Download Status: ${imageRes.statusCode}`);
            console.log('Image Headers:', imageRes.headers);
            
            const imageFile = fs.createWriteStream('downloaded_image.jpg');
            imageRes.pipe(imageFile);
            
            imageFile.on('finish', () => {
              console.log('Image downloaded successfully');
              const stats = fs.statSync('downloaded_image.jpg');
              console.log(`Image size: ${stats.size} bytes`);
            });
          });
          
          imageRequest.on('error', (error) => {
            console.error('Error downloading image:', error);
          });
          
          imageRequest.end();
        } else {
          console.error('No image_url in response');
        }
      } catch (error) {
        console.error('Error parsing API response:', error);
        console.log('Raw response:', apiData);
      }
    });
  });
  
  apiRequest.on('error', (error) => {
    console.error('Error with API request:', error);
  });
  
  apiRequest.end();
}

testImageApiAndDownload();
