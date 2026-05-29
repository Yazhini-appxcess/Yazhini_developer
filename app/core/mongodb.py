"""MongoDB connection setup."""
import os
import socket
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

        self.client = None
        self.db = None
        self.is_fallback = False

    async def connect(self):
        """Connect to MongoDB."""
        try:
            # Validate database name before connecting
            if not self.mongo_db_name or not self.mongo_db_name.strip():
                raise ValueError(
                    "MongoDB database name cannot be empty. "
                    "Please set MONGODB_DB_NAME environment variable."
                )

            # Test if real MongoDB port is open
            is_open = False
            try:
                s = socket.create_connection((self.mongo_host, self.mongo_port), timeout=1.0)
                s.close()
                is_open = True
            except Exception:
                pass

            if not is_open:
                raise ConnectionFailure(f"Could not connect to {self.mongo_host}:{self.mongo_port} (port is closed)")

            self.client = AsyncIOMotorClient(
                self.mongo_url,
                serverSelectionTimeoutMS=5000,  # fail fast instead of hanging
            )
            # Test connection
            await self.client.admin.command("ping")
            self.db = self.client[self.mongo_db_name]
            self.is_fallback = False
            logger.info(
                f"Connected to MongoDB: {self.mongo_url}/{self.mongo_db_name}"
            )
            return True
        except (ConnectionFailure, ValueError, Exception) as e:
            logger.warning(
                f"Failed to connect to MongoDB: {e}. "
                "Falling back to Mock MongoDB (JSON file storage in data/mock_db)"
            )
            try:
                from app.core.mock_mongodb import MockAsyncIOMotorClient
                self.client = MockAsyncIOMotorClient(self.mongo_url)
                self.db = self.client[self.mongo_db_name]
                self.is_fallback = True
                logger.info("Mock MongoDB fallback database initialized successfully.")
                return True
            except Exception as mock_err:
                logger.error(f"Failed to initialize Mock MongoDB: {mock_err}")
                self.client = None
                self.db = None
                return False

    async def disconnect(self):
        """Disconnect from MongoDB."""
        if self.client:
            if not self.is_fallback:
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
            try:
                logger.warning(
                    "MongoDB was not connected at startup – attempting lazy "
                    "connection to %s/%s",
                    self.mongo_url,
                    self.mongo_db_name,
                )
                
                # Check if real MongoDB port is open
                is_open = False
                try:
                    s = socket.create_connection((self.mongo_host, self.mongo_port), timeout=1.0)
                    s.close()
                    is_open = True
                except Exception:
                    pass

                if is_open:
                    self.client = AsyncIOMotorClient(
                        self.mongo_url,
                        serverSelectionTimeoutMS=5000,
                    )
                    self.db = self.client[self.mongo_db_name]
                    self.is_fallback = False
                    logger.info("Lazy connection to real MongoDB established.")
                else:
                    logger.warning("Real MongoDB port is closed. Lazy falling back to Mock MongoDB.")
                    from app.core.mock_mongodb import MockAsyncIOMotorClient
                    self.client = MockAsyncIOMotorClient(self.mongo_url)
                    self.db = self.client[self.mongo_db_name]
                    self.is_fallback = True
            except Exception as e:
                logger.error(f"Lazy fallback to real MongoDB failed: {e}. Using Mock MongoDB.")
                from app.core.mock_mongodb import MockAsyncIOMotorClient
                self.client = MockAsyncIOMotorClient()
                self.db = self.client[self.mongo_db_name]
                self.is_fallback = True
                
        return self.db


# Global MongoDB instance
mongodb_settings = MongoDBSettings()

