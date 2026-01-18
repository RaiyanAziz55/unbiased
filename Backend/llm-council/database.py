# database.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Replace with your actual URI or use an environment variable
MONGODB_URL = "mongodb+srv://unbiased:Unbiased123!@cluster0.3fz40gv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None
    collection = None

db_instance = MongoDB()

async def connect_to_mongo():
    db_instance.client = AsyncIOMotorClient(MONGODB_URL)
    db_instance.db = db_instance.client["unbiased_db"]
    db_instance.collection = db_instance.db["analyses"]
    db_instance.users_collection = db_instance.db["users"]
    print("Connected to MongoDB Atlas")

async def close_mongo_connection():
    db_instance.client.close()
    print("MongoDB connection closed")