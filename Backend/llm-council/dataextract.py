import asyncio
import aiohttp
import json
import sys
import os
import re
from dotenv import load_dotenv

# --- IMPORTS ---
from supadata import Supadata, SupadataError 
from elevenlabs import ElevenLabs 

# --- FIX FOR WINDOWS CONSOLE EMOJI CRASH ---
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

# --- Configuration Constants ---
YELLOW_API_KEY = os.getenv("YELLOW_API_KEY_1")
SUPADATA_API_KEY = os.getenv("SUPADATA_API_KEY_2")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY_1")
ELLEVENLABS_API_KEY = os.getenv("ELLEVENLABS_API_KEY")

YELLOW_API_URL = "https://api.yellowcake.dev/v1/extract-stream"

# Load Prompts Configuration
try:
    with open('prompts.json', 'r') as f:
        PROMPTS_CONFIG = json.load(f)
except FileNotFoundError:
    print("Warning: prompts.json not found. Defaulting to empty config.")
    PROMPTS_CONFIG = []

# --- Helper Functions ---

def identify_platform(url: str) -> str:
    url_lower = url.lower()
    if "instagram.com" in url_lower:
        return "instagram"
    elif "facebook.com" in url_lower:
        return "facebook"
    elif "youtube.com" in url_lower or "youtu.be" in url_lower:
        return "youtube"
    elif "tiktok.com" in url_lower:
        return "tiktok"
    elif "x.com" in url_lower or "twitter.com" in url_lower:
        return "twitter"
    elif "reddit.com" in url_lower:
        return "reddit"
    return "unknown"

def is_video_url(url: str) -> bool:
    """Checks if the URL is EXPLICITLY a video based on URL patterns."""
    url_lower = url.lower()
    if "instagram.com/reel/" in url_lower:
        return True
    if "facebook.com/reel/" in url_lower:
        return True
    if "youtube.com" in url_lower or "youtu.be" in url_lower:
        return True
    if "tiktok.com" in url_lower:
        return True
    # Optional: Add twitter if you want to force video extraction for all tweets
    # if "x.com" in url_lower or "twitter.com" in url_lower:
    #     return True 
    return False

def get_prompt_for_url(platform: str, url: str) -> str:
    # Basic mapping logic (case insensitive)
    p_type = ""
    if platform == "youtube":
        p_type = "Short-Form" if "/shorts/" in url else "Long-Form"
    elif platform == "instagram":
        p_type = "Video" if "/reel/" in url else "Image-Text"
    elif platform == "facebook":
        p_type = "Video" if "/reel/" in url else "Image-Text"
    elif platform == "twitter":
        p_type = "Image-Text"
    elif platform == "tiktok":
        p_type = "Multi-Post"
    elif platform == "reddit":
        p_type = "Multi-Post"

    for entry in PROMPTS_CONFIG:
        if (entry['platform'].lower() == platform.lower() and 
            entry['type'].lower() == p_type.lower()):
            return entry['prompt']
    return ""

def format_output(url, platform, caption=None, image_urls=None, image_description=None, transcription=None):
    """Standardizes the output JSON structure."""
    if image_urls is None:
        image_urls = []
    
    return json.dumps({
        "url": url,
        "platform": platform,
        "scraped_data": {
            "caption": caption,
            "image_urls": image_urls,
            "image_description": image_description,
            "transcription": transcription
        }
    }, indent=2)

# --- API Extraction Handlers ---

async def extract_with_yellowcake(url: str, prompt: str):
    """
    Handles Text/Image extraction.
    Accumulates the stream to parse the final JSON result.
    """
    print(f"   [Yellowcake] Processing {url}...")
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": YELLOW_API_KEY,
    }
    payload = {"url": url, "prompt": prompt}

    full_response_text = ""

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(YELLOW_API_URL, headers=headers, json=payload) as response:
                if response.status != 200:
                    print(f"   [Yellowcake] Error: {response.status}")
                    yield format_output(url, "unknown", caption=f"Error: {response.status}")
                    return

                # Accumulate the stream
                async for chunk in response.content.iter_chunked(1024):
                    if chunk:
                        full_response_text += chunk.decode('utf-8')
            
            # Parse the accumulated SSE data
            # We look for the 'complete' event data which contains the JSON results
            # Regex to find the data object in: data: {"success":true, "data": [...]}
            # This is a simple heuristic for Yellowcake's specific SSE format
            try:
                # Find the line starting with "data: " that contains "success":true
                lines = full_response_text.split('\n')
                json_data = None
                
                for line in lines:
                    if line.startswith("data: ") and '"success":true' in line:
                        clean_json = line.replace("data: ", "").strip()
                        json_data = json.loads(clean_json)
                        break
                
                if json_data and "data" in json_data and len(json_data["data"]) > 0:
                    result = json_data["data"][0] # Assuming single item for single URL
                    
                    # Extract fields based on prompt keys
                    caption = result.get("caption") or result.get("tweet_text") or result.get("text")
                    
                    # Handle images (single string or list)
                    img_raw = result.get("image") or result.get("image_url")
                    image_urls = []
                    if img_raw:
                        if isinstance(img_raw, list):
                            image_urls = img_raw
                        else:
                            image_urls = [img_raw]

                    yield format_output(
                        url, 
                        identify_platform(url), 
                        caption=caption, 
                        image_urls=image_urls,
                        transcription=None
                    )
                else:
                    # Fallback if parsing fails or no data
                    yield format_output(url, identify_platform(url), caption="No data found or parsing failed")

            except Exception as parse_error:
                print(f"   [Yellowcake] Parse Error: {parse_error}")
                yield format_output(url, identify_platform(url), caption=f"Parse Error: {parse_error}")

        except Exception as e:
            print(f"   [Yellowcake] Network Error: {e}")
            yield format_output(url, identify_platform(url), caption=f"Network Error: {e}")

async def extract_with_supadata(url: str):
    """Handles Video extraction via Supadata SDK."""
    print(f"   [Supadata] Processing {url}...")
    
    supadata = Supadata(api_key=SUPADATA_API_KEY)

    try:
        def _fetch_transcript():
            return supadata.transcript(url=url, text=True)

        transcript = await asyncio.to_thread(_fetch_transcript)
        
        content = None
        if hasattr(transcript, 'content'):
            content = transcript.content
        
        yield format_output(
            url, 
            identify_platform(url), 
            caption=None, 
            image_urls=[], 
            transcription=content
        )

    except Exception as e:
        print(f"   [Supadata] Error: {e}")
        yield format_output(url, identify_platform(url), transcription=f"Error: {e}")

async def extract_with_elevenlabs(url: str):
    """Handles RAW Video Transcription via ElevenLabs SDK (Direct Files Only)."""
    print(f"   [ElevenLabs] Processing {url}...")

    client = ElevenLabs(
        api_key=ELLEVENLABS_API_KEY, 
        base_url="https://api.elevenlabs.io"
    )

    try:
        def _transcribe():
            return client.speech_to_text.convert(
                model_id="scribe_v1",
                cloud_storage_url=url,
                tag_audio_events=True,
                diarize=True
            )

        result = await asyncio.to_thread(_transcribe)
        transcript_text = getattr(result, 'text', str(result))
        
        yield format_output(
            url, 
            identify_platform(url), 
            caption=None, 
            image_urls=[], 
            transcription=transcript_text
        )

    except Exception as e:
        print(f"   [ElevenLabs] Error: {e}")
        yield format_output(url, identify_platform(url), transcription=f"Error: {e}")

# --- Main Routing Logic ---

async def route_extraction(url: str):
    platform = identify_platform(url)
    is_video = is_video_url(url)
    
    # 1. Platform Videos (YouTube, TikTok, Instagram, Twitter) -> Supadata
    if is_video and platform in ["instagram", "youtube", "tiktok", "twitter", "facebook"]:
        async for result in extract_with_supadata(url):
            yield result

    # 2. Raw/Other Video -> ElevenLabs 
    elif is_video:
         async for result in extract_with_elevenlabs(url):
            yield result

    # 3. Everything else (Images, Text) -> Yellowcake
    else:
        prompt = get_prompt_for_url(platform, url)
        # Default prompt if missing
        if not prompt: 
            prompt = "Extract caption and main image."
        
        async for result in extract_with_yellowcake(url, prompt):
            yield result

async def main():
    print("Starting Multi-Platform Extraction Engine...")
    
    test_urls = [
        "https://www.instagram.com/p/DTmOe2ZACxt/?img_index=1",
        "https://www.instagram.com/reel/C1lFqShs8Kg/",
        #"https://www.youtube.com/shorts/_BVe8b_sqOc?feature=share",
        "https://x.com/Bannons_WarRoom/status/2012212501480370351", 
        #"https://www.tiktok.com/@studyhiro/video/7587278865341451538?is_from_webapp=1&sender_device=pc",
        "https://www.facebook.com/share/p/18Cb9dmW4L/",
    ]

    for url in test_urls:
        print(f"\n--- Output for {url} ---")
        async for json_output in route_extraction(url):
            print(json_output)
        print("---------------------")

    print("\nApplication finished.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nStopped by user.")