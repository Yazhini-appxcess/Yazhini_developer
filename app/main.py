from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

from app import logger
from app.core.config import setup_logger
from app.core.manager import lifespan
from app.core.redis import RedisHelper
from app.core.settings import Settings
from app.router.base import router as base_router
from app.router.document import router as document_router
from app.router.bot import router as bot_router
from app.router.widget import router as widget_router
from app.router.conversation import router as conversation_router
from app.router.form import router as form_router
from app.router.dashboard import router as dashboard_router
from app.router.admin import router as admin_router
from app.router.ai_config import router as ai_config_router
from app.router.settings import router as settings_router
from app.router.master import router as master_router
from app.router import integrations
from app.router.website import router as website_router
from app.router.website_generator import router as website_generator_router
from app.router.zoho import router as zoho_router


_settings = Settings()

app = FastAPI(lifespan=lifespan, debug=_settings.debug, docs_url="/api/docs")

# Configure CORS to allow frontend requests and external websites
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://54.167.104.118:8000",
        "http://54.167.104.118:3000",
        "http://54.167.104.118",
    ],  # Allow specific origins for security when credentials are enabled
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

setup_logger(_settings.debug)

app.include_router(base_router)
app.include_router(document_router)
app.include_router(dashboard_router)
app.include_router(admin_router)
app.include_router(conversation_router)
app.include_router(bot_router)
app.include_router(settings_router)
app.include_router(master_router)
app.include_router(ai_config_router)
app.include_router(form_router)
app.include_router(widget_router)
app.include_router(integrations.router)
app.include_router(website_router)
app.include_router(website_generator_router)
app.include_router(zoho_router)


def add_cache_layer(app: FastAPI) -> None:
    try:
        app.state.cache = RedisHelper()
    except Exception as e:
        logger.error(e)


# Initialize cache layer
add_cache_layer(app)

# Serve static files (for logo, etc.)
try:
    import os
    from fastapi.staticfiles import StaticFiles
    
    # Calculate the absolute path to the backend root (parent of 'app' folder)
    # This is the most reliable way to find 'static' in a Docker container
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Use data/uploads as the static source because that's where images are saved
    static_dir = os.path.join(base_dir, "data", "uploads")
    
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)
        logger.info(f"Created static directory at {static_dir}")

    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    # Log the files found for easy debugging in docker logs
    # found_files = os.listdir(static_dir) # Can be noisy if many files
    logger.info(f"Successfully mounted static files from: {static_dir}")

except Exception as e:
    logger.error(f"Error mounting static files: {e}")

client = TestClient(app)
