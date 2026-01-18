"""FastAPI backend for LLM Council."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import uuid
import json
import asyncio
import storage
from council import run_full_council, generate_conversation_title, stage1_collect_responses, stage2_collect_rankings, stage3_synthesize_final, calculate_aggregate_rankings
from contextlib import asynccontextmanager
from database import db_instance, connect_to_mongo, close_mongo_connection
from datetime import datetime
from dataextract import route_extraction
import motor
import bcrypt # uv add bcrypt
from bson import ObjectId

# Lifespan handles startup/shutdown instead of deprecated on_event
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="LLM Council API", lifespan=lifespan)

# Enhanced Request Model to capture your desired structure
class SendMessageRequest(BaseModel):
    """Request to send a message, now requiring user and source info."""
    user_id: str  # Added mandatory user identifier
    url: str      # Added mandatory source URL

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateConversationRequest(BaseModel):
    """Request to create a new conversation."""
    pass




class ConversationMetadata(BaseModel):
    """Conversation metadata for list view."""
    id: str
    created_at: str
    title: str
    message_count: int


class Conversation(BaseModel):
    """Full conversation with all messages."""
    id: str
    created_at: str
    title: str
    messages: List[Dict[str, Any]]

# Password hashing setup

# --- Authentication Models ---
class UserAuth(BaseModel):
    username: str
    password: str

# --- Helper Functions ---
def hash_password(password: str) -> str:
    # Convert string to bytes
    pwd_bytes = password.encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # Return as string for MongoDB storage
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Convert both to bytes for comparison
    password_byte_enc = plain_password.encode('utf-8')
    hashed_byte_enc = hashed_password.encode('utf-8')
    # Check compatibility
    return bcrypt.checkpw(password_byte_enc, hashed_byte_enc)

# --- Auth Endpoints ---

@app.post("/api/signup")
async def signup(user_data: UserAuth):
    # Check if user already exists
    existing_user = await db_instance.users_collection.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Hash the password and save
    user_dict = {
        "username": user_data.username,
        "password": hash_password(user_data.password),
        "created_at": datetime.utcnow()
    }
    
    result = await db_instance.users_collection.insert_one(user_dict)
    
    # Return the generated user_id as a string
    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id) 
    }

@app.post("/api/login")
async def login(user_data: UserAuth):
    user = await db_instance.users_collection.find_one({"username": user_data.username})
    
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Return the user_id for frontend session storage
    return {
        "message": "Login successful",
        "user_id": str(user["_id"]),
        "username": user["username"]
    }

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "LLM Council API"}


@app.get("/api/conversations", response_model=List[ConversationMetadata])
async def list_conversations():
    """List all conversations (metadata only)."""
    return storage.list_conversations()


@app.post("/api/conversations", response_model=Conversation)
async def create_conversation(request: CreateConversationRequest):
    """Create a new conversation."""
    conversation_id = str(uuid.uuid4())
    conversation = storage.create_conversation(conversation_id)
    return conversation


@app.get("/api/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Get a specific conversation with all its messages."""
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@app.post("/api/conversations/{conversation_id}/message")
async def send_message(conversation_id: str, request: SendMessageRequest):
    # Check if conversation exists locally
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # STEP 1: Extract all post info automatically from the URL
    # This returns the structured payload: {url, platform, scraped_data}
    raw_extracted_result = await anext(route_extraction(request.url))

    
    if isinstance(raw_extracted_result, str):
        try:
            extracted_data = json.loads(raw_extracted_result)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Scraper returned invalid JSON string")
    else:
        extracted_data = raw_extracted_result

    # 3. Now you can safely access the dictionary keys
    content_to_analyze = extracted_data.get("scraped_data", {}).get("caption") or \
                        extracted_data.get("scraped_data", {}).get("transcription")
    
    if not content_to_analyze:
        raise HTTPException(status_code=400, detail="Could not extract content from URL")

    # STEP 2: Run the LLM Council Process
    storage.add_user_message(conversation_id, content_to_analyze)
    stage1_results, stage2_results, stage3_result, metadata = await run_full_council(
        content_to_analyze
    )

    # STEP 3: Persist the combined data to MongoDB Atlas
    verdict_text = stage3_result.get("response", "No response found")
    try:
        final_doc = {
            "user_id": request.user_id,
            "url": extracted_data["url"],
            "platform": extracted_data["platform"],
            "conversation_id": conversation_id,
            "scraped_data": extracted_data["scraped_data"],
            "analysis": {
                "classification": verdict_text.split('\n')[0].replace("# Classification: ", ""),
                "summary": verdict_text,
                "model_metadata": {
                    "models_involved": len(stage1_results),
                    "timestamp": datetime.utcnow().isoformat()
                }
            },
            "bias_embedding": metadata.get("bias_embedding", [])
        }
        await db_instance.collection.insert_one(final_doc)
    except Exception as e:
        print(f"MongoDB Persistence Error: {e}")

    # Finalize local storage
    storage.add_assistant_message(conversation_id, stage1_results, stage2_results, stage3_result)

    return {
        "stage1": stage1_results,
        "stage2": stage2_results,
        "stage3": stage3_result,
        "metadata": metadata
    }


class SimilarPostRequest(BaseModel):
    # The frontend should send the embedding of the current post
    embedding: List[float] 
    limit: int = 5

@app.post("/api/posts/similar")
async def find_similar_bias(request: SimilarPostRequest):
    """
    Uses Atlas Vector Search to find posts with a similar political bias profile.
    """
    try:
        # Atlas Vector Search Aggregation Stage
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index", # The name you gave your index in Atlas
                    "path": "bias_embedding",
                    "queryVector": request.embedding,
                    "numCandidates": 100, # Number of neighbors to consider
                    "limit": request.limit # Number of results to return
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "url": 1,
                    "platform": 1,
                    "analysis.classification": 1,
                    "analysis.summary": 1,
                    "score": {"$meta": "vectorSearchScore"} # Shows how similar it is
                }
            }
        ]

        cursor = db_instance.collection.aggregate(pipeline)
        results = await cursor.to_list(length=request.limit)

        # Convert ObjectIds for JSON
        for res in results:
            res["_id"] = str(res["_id"])

        return results

    except Exception as e:
        print(f"Vector Search Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform vector search")





@app.get("/api/users/{user_id}/posts")
async def get_user_posts(user_id: str):
    """
    Retrieves all analyzed posts associated with a specific user.
    """
    try:
        # Query the analyses collection for the specific user_id
        cursor = db_instance.collection.find({"user_id": user_id})
        
        # Convert the cursor results into a list
        # Using length=100 or higher to capture the user's history
        posts = await cursor.to_list(length=100)
        
        # Convert MongoDB ObjectIds to strings for JSON serialization
        for post in posts:
            post["_id"] = str(post["_id"])
            
        return {
            "user_id": user_id,
            "total_posts": len(posts),
            "posts": posts
        }
        
    except Exception as e:
        print(f"Error fetching user posts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching posts")



@app.post("/api/conversations/{conversation_id}/message/stream")
async def send_message_stream(conversation_id: str, request: SendMessageRequest):
    """
    Send a message and stream the 3-stage council process.
    Returns Server-Sent Events as each stage completes.
    """
    # Check if conversation exists
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Check if this is the first message
    is_first_message = len(conversation["messages"]) == 0

    async def event_generator():
        try:
            # Add user message
            storage.add_user_message(conversation_id, request.content)

            # Start title generation in parallel (don't await yet)
            title_task = None
            if is_first_message:
                title_task = asyncio.create_task(generate_conversation_title(request.content))

            # Stage 1: Collect responses
            yield f"data: {json.dumps({'type': 'stage1_start'})}\n\n"
            stage1_results = await stage1_collect_responses(request.content)
            yield f"data: {json.dumps({'type': 'stage1_complete', 'data': stage1_results})}\n\n"

            # Stage 2: Collect rankings
            yield f"data: {json.dumps({'type': 'stage2_start'})}\n\n"
            stage2_results, label_to_model = await stage2_collect_rankings(request.content, stage1_results)
            aggregate_rankings = calculate_aggregate_rankings(stage2_results, label_to_model)
            yield f"data: {json.dumps({'type': 'stage2_complete', 'data': stage2_results, 'metadata': {'label_to_model': label_to_model, 'aggregate_rankings': aggregate_rankings}})}\n\n"

            # Stage 3: Synthesize final answer
            yield f"data: {json.dumps({'type': 'stage3_start'})}\n\n"
            stage3_result = await stage3_synthesize_final(request.content, stage1_results, stage2_results)
            yield f"data: {json.dumps({'type': 'stage3_complete', 'data': stage3_result})}\n\n"

            # Wait for title generation if it was started
            if title_task:
                title = await title_task
                storage.update_conversation_title(conversation_id, title)
                yield f"data: {json.dumps({'type': 'title_complete', 'data': {'title': title}})}\n\n"

            # Save complete assistant message
            storage.add_assistant_message(
                conversation_id,
                stage1_results,
                stage2_results,
                stage3_result
            )

            # Send completion event
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"

        except Exception as e:
            # Send error event
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.get("/api/posts/{post_id}")
async def get_single_post(post_id: str):
    """
    Retrieves the full details of a specific analyzed post.
    """
    try:
        # Convert string ID to MongoDB ObjectId
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID format")

        # Find the specific document
        post = await db_instance.collection.find_one({"_id": ObjectId(post_id)})
        
        if post is None:
            raise HTTPException(status_code=404, detail="Post not found")

        # Convert _id to string for JSON serialization
        post["_id"] = str(post["_id"])
        
        return post

    except Exception as e:
        print(f"Error fetching single post: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
