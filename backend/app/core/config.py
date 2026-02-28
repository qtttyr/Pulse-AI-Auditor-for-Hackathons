from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "deepseek/deepseek-chat-v3-0324:free"
    APP_TITLE: str = "Pulse API"
    APP_VERSION: str = "1.0.0"

    class Config:
        env_file = Path(__file__).parent.parent.parent / ".env"
        env_file_encoding = "utf-8"


settings = Settings()
