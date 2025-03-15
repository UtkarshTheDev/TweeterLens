import snscrape.modules.twitter as sntwitter
import pandas as pd
from datetime import datetime
import re
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class TwitterFetcher:
    """Service to fetch Twitter data using snscrape"""
    
    def __init__(self):
        self.tweets = []
    
    def fetch_user_tweets(self, username: str, limit: int = 1000) -> List[Dict[str, Any]]:
        """
        Fetch tweets for a given username
        
        Args:
            username: Twitter username without @
            limit: Maximum number of tweets to fetch
            
        Returns:
            List of tweet dictionaries
        """
        try:
            # Clean username (remove @ if present)
            clean_username = username.strip('@')
            
            # Create query
            query = f"from:{clean_username}"
            
            # Fetch tweets
            tweets_list = []
            for i, tweet in enumerate(sntwitter.TwitterSearchScraper(query).get_items()):
                if i >= limit:
                    break
                
                # Extract hashtags
                hashtags = re.findall(r'#(\w+)', tweet.rawContent)
                
                # Extract mentions
                mentions = re.findall(r'@(\w+)', tweet.rawContent)
                
                # Create tweet dict
                tweet_dict = {
                    'id': tweet.id,
                    'date': tweet.date,
                    'content': tweet.rawContent,
                    'likes': tweet.likeCount,
                    'retweets': tweet.retweetCount,
                    'replies': getattr(tweet, 'replyCount', 0),
                    'hashtags': hashtags,
                    'mentions': mentions,
                    'url': tweet.url,
                }
                
                tweets_list.append(tweet_dict)
            
            self.tweets = tweets_list
            return tweets_list
            
        except Exception as e:
            logger.error(f"Error fetching tweets for {username}: {str(e)}")
            raise Exception(f"Failed to fetch tweets for {username}: {str(e)}")
    
    def get_tweets_dataframe(self) -> pd.DataFrame:
        """Convert tweets list to pandas DataFrame"""
        if not self.tweets:
            return pd.DataFrame()
        
        return pd.DataFrame(self.tweets)
    
    def estimate_impressions(self, likes: int, retweets: int, replies: int) -> int:
        """
        Estimate tweet impressions based on engagement metrics
        Simple formula: (likes * 30) + (retweets * 50) + (replies * 15)
        """
        return (likes * 30) + (retweets * 50) + (replies * 15) 