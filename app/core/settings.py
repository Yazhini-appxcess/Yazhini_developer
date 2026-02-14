from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    debug: bool = False
    app_env: str = "development"
    timezone: str = "America/Los_Angeles"

    class Config:  # noqa: N801
        env_file = ".env"
        extra = "ignore"


settings = Settings()
