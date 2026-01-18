import asyncio
import aiohttp
import json
import sys
import os
import supadata

# Configuration constants

# In production, use environment variables for keys: os.getenv("API_KEY")
YELLOW_API_KEY = os.getenv("YELLOW_API_KEY_1")
SUPADATA_API_KEY = os.getenv("SUPADATA_API_KEY_1")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY_1")
ELLEVENLABS_API_KEY = os.getenv("ELLEVENLABS_API_KEY")

def is_video_url(url: str) -> bool:
    """
    Checks if the URL points to a video based on file extension or platform patterns.
    """
    url_lower = url.lower()
    
    # 1. Check for direct video file extensions
    video_extensions = ('.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv')
    if url_lower.endswith(video_extensions):
        return True
    
    # 2. Check for common video platforms
    # Note: 'instagram.com/p/' is ambiguous (could be photo or video), 
    # but '/reel/' or '/tv/' are definitely videos.
    video_platforms = [
        "youtube.com", "youtu.be",
        "vimeo.com",
        "tiktok.com",
        "instagram.com/reel/",
        "instagram.com/tv/" 
    ]
    
    for platform in video_platforms:
        if platform in url_lower:
            return True

    return False

async def process_url(url: str):
    if url.beginswith("https://www.instagram.com/"):
        return "instagram"
    elif url.beginswith("https://www.youtube.com/"):
        return "youtube"
    elif url.beginswith("https://www.tiktok.com/"):
        return "tiktok"
    elif url.beginswith("https://x.com/"):
        return "twitter"
    elif url.beginswith("https://www.reddit.com/"):
        return "reddit"

async def extract_stream(platform: str,url: str, prompt: str):
    """
    Sends a POST request and yields chunks of data as they arrive.
    """


    if(str(platform) == "instagram"):
        # Use yellowcake for images, captions, comments
        # use supadata for videos
        pass
    elif(str(platform) == "youtube"):
        # Use ellevenlabs for videos
        # use yellowcake for comments & caption
        pass
    elif(str(platform) == "tiktok"):
        #use ellevenlabs for videos
        #use yellowcake for comments & caption
        pass
    elif(str(platform) == "twitter"):
        #use yellowcake ellevenlabs for videos
        #use yellowcake for comments & caption
        pass
    elif(str(platform) == "reddit"):
        #use yellowcake ellevenlabs for videos
        #use yellowcake for comments & caption
        pass
        
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": YELLOW_API_KEY,
    }
    payload = {
        "url": url,
        "prompt": prompt
    }

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(API_URL, headers=headers, json=payload) as response:
                if response.status != 200:
                    print(f"Error: Received status code {response.status}")
                    return

                async for chunk in response.content.iter_chunked(1024):
                    if chunk:
                        yield chunk.decode('utf-8')
                        
        except aiohttp.ClientError as e:
            print(f"Network error occurred: {e}")

async def main():
    print("Starting the application...")

    # You can change this to a video URL to test the condition
    # Example video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    target_url = "https://www.instagram.com/p/DTnxZpHD39j/"
    prompt = ""

    if not target_url:
        print("No URL provided.")
        return

    print("URL used for testing: ", target_url)

    # --- CONDITIONAL CHECK ---
    if is_video_url(target_url):
        print("\n[!] Video URL detected.")
        print("    -> Switching to video extraction implementation (Pending)...")
        # Video extraction logic will be added here later
    else:
        print("\n[i] Standard URL detected. Starting text stream extraction...")
        print(f"Prompt used: \"{prompt}\"\n")
        
        print("--- Stream Output ---")
        async for text_chunk in extract_stream(target_url, prompt):
            print(text_chunk, end='', flush=True)
        print("\n---------------------")

    print("Application finished.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nApplication stopped by user.")