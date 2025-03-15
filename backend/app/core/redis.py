import json
import redis
from app.core.config import settings

# Create Redis connection
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)

def get_cache(key: str):
    """Get data from Redis cache"""
    data = redis_client.get(key)
    if data:
        return json.loads(data)
    return None

def set_cache(key: str, data: dict, expire: int = None):
    """Set data in Redis cache with expiration"""
    if expire is None:
        expire = settings.REDIS_CACHE_EXPIRE
    redis_client.setex(key, expire, json.dumps(data))

def delete_cache(key: str):
    """Delete data from Redis cache"""
    redis_client.delete(key)

def cache_key_for_username(username: str) -> str:
    """Generate a cache key for a Twitter username"""
    return f"tweetx:stats:{username.lower()}" 