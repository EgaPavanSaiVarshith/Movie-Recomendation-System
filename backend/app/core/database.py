import motor.motor_asyncio
import certifi
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

client: motor.motor_asyncio.AsyncIOMotorClient = None
db = None

async def connect_to_mongo():
    global client, db
    try:
        logger.info(f"Connecting to MongoDB database: {settings.DATABASE_NAME}")
        client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.MONGODB_URL,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=15000,
            connectTimeoutMS=15000,
            socketTimeoutMS=15000,
        )
        db = client[settings.DATABASE_NAME]
        # Verify connection
        await client.admin.command('ping')
        logger.info(f"[OK] Connected to MongoDB: {settings.DATABASE_NAME}")
        print(f"[OK] Connected to MongoDB: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.error(f"[FAIL] MongoDB connection error: {e}")
        print(f"[FAIL] MongoDB connection error: {e}")
        # Still set db so the app starts, but operations will fail with clear errors
        if client:
            db = client[settings.DATABASE_NAME]

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

def get_database():
    if db is None:
        raise Exception("Database not initialized. MongoDB connection may have failed.")
    return db
