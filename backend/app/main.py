from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging.config
from app.core.config import settings
from app.api.api_v1.api import api_router
from app.utils.logging import setup_logging

# Setup logging
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
# Define allowed origins
allowed_origins = [
    "http://localhost:3000",  # Local development
    "https://tweetx-frontend.vercel.app",  # Vercel default domain
    "https://tweetx.vercel.app",  # Vercel subdomain
]

# In development mode, allow all origins
if settings.DEBUG:
    allowed_origins = ["*"]
# Add any custom domains from environment variable
elif settings.CORS_ORIGINS:
    allowed_origins.extend(settings.CORS_ORIGINS.split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to TweetX API - Twitter Contribution & Engagement Tracker"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 