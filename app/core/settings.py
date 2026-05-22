import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    debug: bool = False
    app_env: str = "development"
    timezone: str = "America/Los_Angeles"
    
    # App URLs
    api_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"
    
    # Zoho Configuration
    zoho_redirect_uri: str = "http://localhost:8000/api/zoho/callback"

    class Config:  # noqa: N801
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        extra = "ignore"
        case_sensitive = False
        env_file_encoding = "utf-8"


settings = Settings()
