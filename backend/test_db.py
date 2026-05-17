import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    try:
        client = AsyncIOMotorClient(
            'mongodb+srv://23831a6648_db_user:Chintu%40123@pavancluster.buzlapd.mongodb.net/',
            serverSelectionTimeoutMS=5000,
            tlsCAFile=certifi.where()
        )
        db = client['cineai']
        result = await db.command('ping')
        print('SUCCESS:', result)
    except Exception as e:
        print(f'ERROR: {type(e).__name__}: {e}')

asyncio.run(test())
