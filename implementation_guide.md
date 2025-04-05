# Google Custom Search Engine Integration Guide

This guide will walk you through setting up a Google Custom Search Engine for your Kitchen Assistant application to fetch recipe images that are free for use.

## 1. Create a Programmable Search Engine

1. Go to [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click on **Add** to create a new search engine
3. In the "Sites to search" section, select **Search the entire web** 
4. Name your search engine (e.g., "Recipe Images Search")
5. Click **Create**

## 2. Configure for Image Search

After creating your search engine:

1. Click on your newly created search engine from the list
2. On the left sidebar, click on **Settings**
3. Click on the **Search features** tab
4. Under "Image Search," toggle the switch to **ON**
5. Click **Save** to apply the changes

## 3. Get Your Search Engine ID

1. From the same settings page, click on **Setup** in the left sidebar
2. Look for the "Search engine ID" field - it will show a value like `a1b2c3d4e5f6g7h8i9`
3. Copy this ID - this is your `GOOGLE_CSE_ID`

## 4. Update Your .env File

1. Open your project's `.env` file located at `backend/.env`
2. Find the line `GOOGLE_CSE_ID=YOUR_SEARCH_ENGINE_ID_GOES_HERE`
3. Replace `YOUR_SEARCH_ENGINE_ID_GOES_HERE` with the ID you copied
4. Save the file

Your `.env` file should now look like this (with your actual ID):
```
GOOGLE_CSE_API_KEY=AIzaSyAXy6wl_8IkOWL4eSfLa83uo1vjAUoCMZ4
...
GOOGLE_CSE_ID=a1b2c3d4e5f6g7h8i9
```

## 5. Test the Integration

1. Start your Kitchen Assistant application:
   ```bash
   cd backend
   python app.py
   ```
   
2. Open your browser and navigate to your application (usually http://localhost:5000)

3. Select any recipe to view its details

4. The application should now fetch and display an image from Google's Custom Search API instead of Unsplash

5. Check the browser console and server logs for any error messages if images don't appear

## Troubleshooting

If images aren't displaying correctly:

1. **Verify API Quota**: The free tier of Custom Search API has a limit of 100 queries per day. Check if you've exceeded this limit.

2. **Check API Key Restrictions**: Make sure your API key doesn't have any domain restrictions that would prevent it from working.

3. **Enable Billing**: If you need more queries per day, you may need to enable billing on your Google Cloud account.

4. **Check Server Logs**: Look for error messages in your application logs that might indicate what's going wrong.

5. **Test API Directly**: Try testing the API with curl or a tool like Postman to verify your credentials work:
   ```bash
   curl "https://customsearch.googleapis.com/customsearch/v1?q=pasta&cx=YOUR_CSE_ID&key=YOUR_API_KEY&searchType=image&rights=cc_publicdomain"
   ```

## API Usage Notes

- The application is set up to search for images that are labeled for reuse (CC licenses)
- The implementation requests multiple images and tries them in order until it finds one that works
- If no suitable image is found, the application will fall back to a placeholder image

