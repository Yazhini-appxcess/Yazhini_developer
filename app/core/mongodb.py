"""MongoDB connection setup."""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from loguru import logger
from dotenv import load_dotenv

load_dotenv()


class MongoDBSettings:
    """MongoDB connection settings."""

    def __init__(self):
        # Get MongoDB connection details from environment variables
        self.mongo_host = os.getenv("MONGODB_HOST", "localhost")
        self.mongo_port = int(os.getenv("MONGODB_PORT", "27017"))
        # Ensure database name is never empty
        mongo_db_name = os.getenv("MONGODB_DB_NAME", "").strip()
        self.mongo_db_name = mongo_db_name if mongo_db_name else "eti_bot"

        # Support full URI (e.g. Atlas) as MONGODB_URI, fall back to host:port
        mongo_uri = os.getenv("MONGODB_URI", "").strip()
        if mongo_uri:
            self.mongo_url = mongo_uri
        else:
            self.mongo_url = f"mongodb://{self.mongo_host}:{self.mongo_port}"

        self.client: AsyncIOMotorClient | None = None
        self.db = None

    async def connect(self):
        """Connect to MongoDB."""
        try:
            # Validate database name before connecting
            if not self.mongo_db_name or not self.mongo_db_name.strip():
                raise ValueError(
                    "MongoDB database name cannot be empty. "
                    "Please set MONGODB_DB_NAME environment variable."
                )

            self.client = AsyncIOMotorClient(
                self.mongo_url,
                serverSelectionTimeoutMS=5000,  # fail fast instead of hanging
            )
            # Test connection
            await self.client.admin.command("ping")
            self.db = self.client[self.mongo_db_name]
            logger.info(
                f"Connected to MongoDB: {self.mongo_url}/{self.mongo_db_name}"
            )
            return True
        except (ConnectionFailure, ValueError, Exception) as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            self.client = None
            self.db = None
            return False

    async def disconnect(self):
        """Disconnect from MongoDB."""
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            logger.info("Disconnected from MongoDB")

    def get_database(self):
        """Get database instance.

        If the startup connect() failed (db is None), attempt a synchronous
        client creation so callers still get a usable handle rather than a
        hard crash.  Motor operations are still async; only the *client*
        object creation is synchronous here.
        """
        if self.db is None:
            # Lazy fallback: create the client without the async ping so we
            # don't block the event loop.  The first real async operation will
            # surface any connection problem with a proper Motor/PyMongo error
            # rather than our opaque "call connect() first" message.
            try:
                logger.warning(
                    "MongoDB was not connected at startup – attempting lazy "
                    "connection to %s/%s",
                    self.mongo_url,
                    self.mongo_db_name,
                )
                self.client = AsyncIOMotorClient(
                    self.mongo_url,
                    serverSelectionTimeoutMS=5000,
                )
                self.db = self.client[self.mongo_db_name]
            except Exception as e:
                raise RuntimeError(
                    f"MongoDB connection failed: {e}. "
                    f"Make sure MongoDB is running on {self.mongo_url} "
                    f"and MONGODB_HOST / MONGODB_PORT / MONGODB_DB_NAME are set correctly in .env"
                ) from e
        return self.db


# Global MongoDB instance
mongodb_settings = MongoDBSettings()
