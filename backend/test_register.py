import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def test():
    try:
        client = AsyncIOMotorClient(
            'mongodb+srv://23831a6648_db_user:Chintu%40123@pavancluster.buzlapd.mongodb.net/',
            serverSelectionTimeoutMS=5000,
            tlsCAFile=certifi.where()
        )
        db = client['cineai']
        
        # Test ping
        result = await db.command('ping')
        print(f'Ping: {result}')
        
        # Test insert
        new_user = {
            "username": "testuser_script",
            "email": "testscript@test.com",
            "password_hash": pwd_context.hash("password123"),
            "full_name": "Test Script User",
            "avatar_url": None,
            "preferred_languages": [],
            "preferred_genres": [],
            "watchlist": [],
            "created_at": datetime.utcnow(),
        }
        
        # Clean up first
        await db.users.delete_one({"email": "testscript@test.com"})
        
        result = await db.users.insert_one(new_user)
        print(f'Insert SUCCESS: {result.inserted_id}')
        
        # Clean up
        await db.users.delete_one({"_id": result.inserted_id})
        print('Cleanup done')
        
    except Exception as e:
        print(f'ERROR: {type(e).__name__}: {e}')

asyncio.run(test())
