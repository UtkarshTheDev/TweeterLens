from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Any, Dict, List
import logging

from app.models.twitter import (
    TwitterUsernameRequest,
    TwitterStatsResponse,
    TwitterErrorResponse
)
from app.services.twitter_analyzer import TwitterAnalyzer
from app.core.redis import get_cache, set_cache, cache_key_for_username

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/stats", response_model=TwitterStatsResponse, responses={400: {"model": TwitterErrorResponse}})
async def get_twitter_stats(request: TwitterUsernameRequest) -> Dict[str, Any]:
    """
    Get comprehensive Twitter stats for a username
    
    - **username**: Twitter username to analyze (with or without @)
    - **limit**: Maximum number of tweets to fetch (default: 1000)
    
    Returns all stats including contribution graph, engagement metrics, and hashtags/mentions analysis.
    
    Note: If Twitter data cannot be fetched due to API limitations, mock data will be provided.
    """
    try:
        # Clean username
        username = request.username.strip('@').lower()
        
        # Check cache first
        cache_key = cache_key_for_username(username)
        cached_stats = get_cache(cache_key)
        
        if cached_stats:
            logger.info(f"Returning cached stats for {username}")
            return cached_stats
        
        # If not in cache, fetch and analyze
        analyzer = TwitterAnalyzer()
        analyzer.load_tweets(username, request.limit)
        stats = analyzer.analyze_all()
        
        # Check if there was an error
        if "error" in stats:
            raise HTTPException(status_code=400, detail=stats["error"])
        
        # Cache the results
        set_cache(cache_key, stats)
        
        return stats
        
    except Exception as e:
        logger.error(f"Error processing request for {request.username}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/refresh", response_model=TwitterStatsResponse, responses={400: {"model": TwitterErrorResponse}})
async def refresh_twitter_stats(request: TwitterUsernameRequest) -> Dict[str, Any]:
    """
    Force refresh Twitter stats for a username (bypass cache)
    
    - **username**: Twitter username to analyze (with or without @)
    - **limit**: Maximum number of tweets to fetch (default: 1000)
    
    Returns freshly fetched stats.
    
    Note: If Twitter data cannot be fetched due to API limitations, mock data will be provided.
    """
    try:
        # Clean username
        username = request.username.strip('@').lower()
        
        # Fetch and analyze (bypass cache)
        analyzer = TwitterAnalyzer()
        analyzer.load_tweets(username, request.limit)
        stats = analyzer.analyze_all()
        
        # Check if there was an error
        if "error" in stats:
            raise HTTPException(status_code=400, detail=stats["error"])
        
        # Update cache
        cache_key = cache_key_for_username(username)
        set_cache(cache_key, stats)
        
        return stats
        
    except Exception as e:
        logger.error(f"Error refreshing stats for {request.username}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return {"status": "ok", "service": "TweetX API"} 