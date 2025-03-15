from fastapi import APIRouter
from app.api.api_v1.endpoints import twitter

api_router = APIRouter()
api_router.include_router(twitter.router, prefix="/twitter", tags=["twitter"]) 