import asyncio
import aiohttp
import json
import sys
import os
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
SUPADATA_API_KEY = os.getenv("SUPADATA_API_KEY_1")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY_1")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

YELLOW_API_URL = "https://api.yellowcake.dev/v1/extract-stream"

# Load Prompts Configuration
try:
    with open('Data_Extraction/prompts.json', 'r') as f:
        PROMPTS_CONFIG = json.load(f)
except FileNotFoundError:
    print("Warning: prompts.json not found. Defaulting to empty config.")
    PROMPTS_CONFIG = []

# --- Helper Functions ---

def identify_platform(url: str) -> str:
    url_lower = url.lower()
    if "instagram.com" in url_lower:
        return "Instagram"
    elif "youtube.com" in url_lower or "youtu.be" in url_lower:
        return "Youtube"
    elif "tiktok.com" in url_lower:
        return "Tiktok"
    elif "x.com" in url_lower or "twitter.com" in url_lower:
        return "Twitter"
    elif "reddit.com" in url_lower:
        return "Reddit"
    return "Unknown"

def is_video_url(url: str) -> bool:
    """Checks if the URL is EXPLICITLY a video based on URL patterns."""
    url_lower = url.lower()
    if "instagram.com/reel/" in url_lower:
        return True
    if "youtube.com" in url_lower or "youtu.be" in url_lower:
        return True
    if "tiktok.com" in url_lower:
        return True
    return False

def get_prompt_for_url(platform: str, url: str) -> str:
    p_type = ""
    
    if platform == "Youtube":
        if "/shorts/" in url:
            p_type = "Short-Form"
        else:
            p_type = "Long-Form"
    elif platform == "Instagram":
        if "/reel/" in url:
            p_type = "Video" 
        else:
            p_type = "Image-Text" 
    elif platform == "Twitter":
        p_type = "Image-Text" 
    elif platform == "Tiktok":
        p_type = "Multi-Post"
    elif platform == "Reddit":
        p_type = "Multi-Post"

    for entry in PROMPTS_CONFIG:
        if (entry['platform'].lower() == platform.lower() and 
            entry['type'].lower() == p_type.lower()):
            return entry['prompt']
    return ""

# --- API Extraction Handlers ---

async def extract_with_yellowcake(url: str, prompt: str):
    """
    Handles Text/Image extraction streaming via Yellowcake.
    """
    print(f"   [Yellowcake] Starting extraction...")
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": YELLOW_API_KEY,
    }
    payload = {"url": url, "prompt": prompt}

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(YELLOW_API_URL, headers=headers, json=payload) as response:
                if response.status != 200:
                    print(f"   [Yellowcake] Error: {response.status}")
                    return 

                async for chunk in response.content.iter_chunked(1024):
                    if chunk:
                        yield chunk.decode('utf-8')
                        
        except Exception as e:
            print(f"   [Yellowcake] Network Error: {e}")

async def extract_with_supadata(url: str):
    """Handles Video extraction via Supadata SDK."""
    print("   [Supadata] Starting Video Extraction...")
    
    supadata = Supadata(api_key=SUPADATA_API_KEY)

    try:
        def _fetch_transcript():
            # Supadata handles YouTube, TikTok, and Instagram URLs natively
            return supadata.transcript(url=url, text=True)

        transcript = await asyncio.to_thread(_fetch_transcript)

        if hasattr(transcript, 'content'):
            data = {"content": transcript.content, "status": "completed"}
            yield json.dumps(data, indent=2)
        else:
            data = {"status": "processing", "job_id": transcript.job_id}
            yield json.dumps(data, indent=2)

    except SupadataError as error:
        err_msg = {"error": error.error, "message": error.message}
        print(f"   [Supadata] API Error: {err_msg}")
        yield json.dumps(err_msg, indent=2)
    except Exception as e:
        print(f"   [Supadata] Unexpected Error: {e}")

async def extract_with_elevenlabs(url: str):
    """
    Handles RAW Video Transcription via ElevenLabs SDK.
    Only works for direct file URLs (e.g., ends in .mp4, .mp3).
    """
    print("   [ElevenLabs] Starting Video Transcription...")

    client = ElevenLabs(
        api_key=ELEVENLABS_API_KEY, 
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
        
        yield json.dumps({
            "transcript": transcript_text, 
            "status": "completed"
        }, indent=2)

    except Exception as e:
        print(f"   [ElevenLabs] Error: {e}")
        yield json.dumps({"error": str(e)}, indent=2)

# --- Main Routing Logic ---

async def route_extraction(url: str):
    platform = identify_platform(url)
    is_video = is_video_url(url)
    
    print(f"\nProcessing: {url}")
    print(f"   -> Platform: {platform} | Type: {'Video' if is_video else 'Image/Text'}")

    # 1. Platform Videos (YouTube, TikTok, Instagram) -> Supadata
    # Supadata is built to handle these specific platform URLs
    if is_video and platform in ["Instagram", "Youtube", "Tiktok"]:
        async for chunk in extract_with_supadata(url):
            yield chunk

    # 2. Raw/Other Video -> ElevenLabs 
    # (Fallback if we have a direct file URL for a platform not listed above)
    elif is_video:
         async for chunk in extract_with_elevenlabs(url):
            yield chunk

    # 3. Everything else (Images, Text, Twitter, Reddit) -> Yellowcake
    else:
        prompt = get_prompt_for_url(platform, url)
        if not prompt:
            print(f"   [!] Warning: No prompt found for {platform}. Using default.")
        
        async for chunk in extract_with_yellowcake(url, prompt):
            yield chunk

async def main():
    print("Starting Multi-Platform Extraction Engine...")
    
    test_urls = [
        "https://www.instagram.com/p/DTmCVpqAAHe/?img_index=2",
        "https://www.instagram.com/reel/DS-wO9ukrDe/",
        "https://www.youtube.com/shorts/_BVe8b_sqOc",
        "https://x.com/ConcreteXCrypto/status/2012302995472408696",
        "https://www.tiktok.com/@studyhiro/video/7587278865341451538?is_from_webapp=1&sender_device=pc",
    ]
    
    for url in test_urls:
        print("\n--- Stream Output ---")
        async for data_chunk in route_extraction(url):
            print(data_chunk, end='', flush=True)
        print("\n---------------------")

    print("\nApplication finished.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nStopped by user.")