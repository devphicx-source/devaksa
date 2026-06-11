"""
Devaksa Backend — Database Connection
Async MongoDB connection using Motor driver (replaces Mongoose).
"""

from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Connect to MongoDB Atlas. Called on app startup."""
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.devaks  # Same database name as the Node.js version
    print("✅ MongoDB Connected")


async def close_db():
    """Close MongoDB connection. Called on app shutdown."""
    global client
    if client:
        client.close()
        print("🔌 MongoDB Disconnected")


def get_db():
    """Get the database instance."""
    return db
