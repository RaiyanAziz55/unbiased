import httpx
import asyncio
import json
import sys
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime

# --- MONGODB SETUP ---
uri = "mongodb+srv://unbiased:Unbiased123!@cluster0.3fz40gv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client_db = MongoClient(uri, server_api=ServerApi('1'))
db = client_db["unbiased_db"]
collection = db["analyses"]

async def test_request():
    print(">>> STARTING FULL COUNCIL TEST", flush=True)
    base_url = "http://localhost:8001/api/conversations"
    
    # 1. Structure your initial payload as defined in your prompt
    payload = {
        "url": "https://www.instagram.com/p/C_sample123",
        "platform": "instagram",
        "scraped_data": {
            "caption": "Time to get back to basics. #Freedom #Economy #SmallBiz",
            "image_urls": ["https://cdn.example.com/img1.jpg"],
            "visuals": ["A speaker standing in a clean, professional office with a national flag"],
            "transcription": "Government spending is out of control. We need individual responsibility."
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            # STEP 1: Create Conversation
            print(">>> STEP 1: Creating Conversation...", flush=True)
            create_resp = await client.post(base_url, json={"content": "Analysis for " + payload["url"]})
            create_resp.raise_for_status()
            conv_id = create_resp.json()["id"]

            # STEP 2: Send Data to the Council
            print(f">>> STEP 2: Running Council Analysis...", flush=True)
            msg_url = f"{base_url}/{conv_id}/message"
            
            # Send the content string for processing
            content_str = f"Analyze this {payload['platform']} post: {payload['scraped_data']['caption']}"
            response = await client.post(msg_url, json={"content": content_str}, timeout=300.0)
            
            if response.status_code == 200:
                result = response.json()
                print("\n" + "="*50 + "\nFINAL COUNCIL VERDICT RECEIVED\n" + "="*50)
                
                # Extracting data for your specific schema
                verdict_text = result.get("stage3", {}).get("response", "No response found")
                metadata = result.get("metadata", {})
                
                # 2. Build the exact document structure you requested
                final_doc = {
                    "url": payload["url"],
                    "platform": payload["platform"],
                    "scraped_data": payload["scraped_data"],
                    "analysis": {
                        "classification": "RIGHT",
                        "summary": verdict_text,
                        "evidence": ["Evidence extracted from LLM stages..."], # Placeholder for your parsing logic
                        "model_metadata": {
                            "models_involved": len(result.get("stage1", [])),
                            "timestamp": datetime.utcnow().isoformat()
                        }
                    },
                    "bias_embedding": metadata.get("bias_embedding", []) # Extracted from the council metadata
                }

                # STEP 3: PERSIST TO MONGODB ATLAS
                try:
                    inserted = collection.insert_one(final_doc)
                    print(f"\n[Atlas] Successfully saved document. ID: {inserted.inserted_id}")
                except Exception as mongo_err:
                    print(f"\n[Atlas] MongoDB Error: {mongo_err}")

            else:
                print(f">>> ERROR: Council failed with status {response.status_code}")

        except Exception as e:
            print(f">>> TEST FAILED: {type(e).__name__}: {str(e)}", flush=True)

if __name__ == "__main__":
    asyncio.run(test_request())