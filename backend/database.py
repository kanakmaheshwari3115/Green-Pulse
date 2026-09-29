from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

client = None
database = None

async def connect_to_mongo():
    global client, database
    try:
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/greenpulse")
        client = AsyncIOMotorClient(mongodb_url)
        await client.admin.command('ping')
        database = client.greenpulse
        print("[OK] Connected to MongoDB")
        
        await create_indexes()
        
    except ConnectionFailure as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("[OK] MongoDB connection closed")

async def create_indexes():
    try:
        sensor_data_collection = database.sensor_data
        await sensor_data_collection.create_index([("park_id", 1), ("timestamp", -1)])
        await sensor_data_collection.create_index([("node_id", 1), ("timestamp", -1)])
        
        parks_collection = database.parks
        await parks_collection.create_index("park_id", unique=True)
        
        health_scores_collection = database.health_scores
        await health_scores_collection.create_index([("park_id", 1), ("timestamp", -1)])
        
        print("[OK] Database indexes created")
    except Exception as e:
        print(f"[ERROR] Failed to create indexes: {e}")

def get_database():
    return database

def get_collection(collection_name: str):
    return database[collection_name]
