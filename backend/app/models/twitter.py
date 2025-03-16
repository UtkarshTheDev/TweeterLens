from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime

class TwitterUsernameRequest(BaseModel):
    """Request model for Twitter username"""
    username: str = Field(..., description="Twitter username to analyze")
    limit: Optional[int] = Field(1000, description="Maximum number of tweets to fetch")

class TwitterErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")

class ContributionData(BaseModel):
    """GitHub-style contribution data model"""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    count: int = Field(..., description="Number of tweets on this date")
    level: int = Field(..., description="Activity level (0-4) for heatmap coloring")

class ContributionStats(BaseModel):
    """Contribution graph stats model"""
    tweets_per_year: Dict[int, int] = Field(..., description="Total tweets per year")
    tweets_per_month: List[Dict[str, Any]] = Field(..., description="Total tweets per month")
    tweets_per_day: Dict[str, int] = Field(..., description="Total tweets per day")
    hour_distribution: Dict[int, int] = Field(..., description="Hour-wise distribution")
    peak_day: Dict[str, Any] = Field(..., description="Day with highest tweets")
    most_active_months: List[Dict[str, Any]] = Field(..., description="Most active months")
    most_active_weeks: List[Dict[str, Any]] = Field(..., description="Most active weeks")
    activity_trend: Dict[str, int] = Field(..., description="Tweet activity trend over time")
    github_contribution_data: List[ContributionData] = Field(..., description="GitHub-style contribution data for the last 365 days")
    current_streak: int = Field(..., description="Current streak of consecutive days with tweets")
    longest_streak: int = Field(..., description="Longest streak of consecutive days with tweets")
    day_of_week_distribution: Dict[int, int] = Field(..., description="Distribution of tweets by day of week (0=Monday, 6=Sunday)")

class EngagementStats(BaseModel):
    """Engagement metrics stats model"""
    total_likes: int = Field(..., description="Total likes received")
    total_retweets: int = Field(..., description="Total reposts (retweets) received")
    total_impressions: int = Field(..., description="Total estimated impressions")
    highest_impressions_tweet: Dict[str, Any] = Field(..., description="Tweet with highest impressions")
    highest_likes_tweet: Dict[str, Any] = Field(..., description="Tweet with highest likes")
    highest_retweets_tweet: Dict[str, Any] = Field(..., description="Tweet with highest retweets")
    highest_replies_tweet: Dict[str, Any] = Field(..., description="Tweet with highest replies")
    avg_likes_per_tweet: float = Field(..., description="Average likes per tweet")
    avg_retweets_per_tweet: float = Field(..., description="Average retweets per tweet")
    likes_trend: Dict[str, int] = Field(..., description="Likes trend over time")
    impressions_trend: Dict[str, int] = Field(..., description="Impressions trend over time")
    best_hours_to_post: List[Dict[str, Any]] = Field(..., description="Best hours to post")

class HashtagsMentionsStats(BaseModel):
    """Hashtags and mentions analysis model"""
    top_hashtags: Dict[str, int] = Field(..., description="Top hashtags used")
    top_mentions: Dict[str, int] = Field(..., description="Most mentioned users")
    word_cloud: Dict[str, int] = Field(..., description="Word cloud for most used words")

class TwitterStatsResponse(BaseModel):
    """Complete Twitter stats response model"""
    contribution: ContributionStats = Field(..., description="Contribution graph stats")
    engagement: EngagementStats = Field(..., description="Engagement metrics stats")
    hashtags_mentions: HashtagsMentionsStats = Field(..., description="Hashtags and mentions analysis")
    total_tweets: int = Field(..., description="Total number of tweets analyzed")
    date_range: Dict[str, str] = Field(..., description="Date range of analyzed tweets")
    is_mock_data: bool = Field(False, description="Indicates if the data is mock data due to Twitter API limitations") 