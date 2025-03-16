import os
import re
# Fix for Pydantic v2.4+ where BaseSettings has been moved
try:
    # Try importing from pydantic-settings (for Pydantic v2.4+)
    from pydantic_settings import BaseSettings
except ImportError:
    # Fallback to old import path (for Pydantic < v2.4)
    from pydantic import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Function to extract password from Redis connection string
def extract_redis_password(connection_string):
    if not connection_string:
        return ""
    # Redis connection string format: redis://[:password@]host[:port][/database]
    match = re.search(r'redis://(:[^@]+)@', connection_string)
    if match:
        # Remove the leading colon
        return match.group(1)[1:]
    return ""

class Settings(BaseSettings):
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "TweetX")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # CORS settings
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "")  # Comma-separated list of allowed origins
    
    # Redis settings
    REDIS_CONNECTION_STRING: str = os.getenv("REDIS_CONNECTION_STRING", "")
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB: int = int(os.getenv("REDIS_DB", 0))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", extract_redis_password(os.getenv("REDIS_CONNECTION_STRING", "")))
    REDIS_CACHE_EXPIRE: int = int(os.getenv("REDIS_CACHE_EXPIRE", 900))  # 15 minutes
    
    # Celery settings
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")
    
    class Config:
        case_sensitive = True

settings = Settings() 