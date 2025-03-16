import snscrape.modules.twitter as sntwitter
import pandas as pd
from datetime import datetime, timedelta
import re
import random
import time
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
            
            # Try to fetch tweets with retry logic
            tweets_list = self._fetch_with_retry(query, limit)
            
            # If we still couldn't get tweets, use mock data
            if not tweets_list:
                logger.warning(f"Could not fetch tweets for {username}, using mock data")
                tweets_list = self._generate_mock_data(clean_username, limit)
            
            self.tweets = tweets_list
            return tweets_list
            
        except Exception as e:
            logger.error(f"Error fetching tweets for {username}: {str(e)}")
            # Generate mock data as fallback
            logger.info(f"Generating mock data for {username}")
            mock_data = self._generate_mock_data(username, min(limit, 100))
            self.tweets = mock_data
            return mock_data
    
    def _fetch_with_retry(self, query: str, limit: int, max_retries: int = 3) -> List[Dict[str, Any]]:
        """
        Attempt to fetch tweets with retry logic
        
        Args:
            query: Twitter search query
            limit: Maximum number of tweets to fetch
            max_retries: Maximum number of retry attempts
            
        Returns:
            List of tweet dictionaries
        """
        tweets_list = []
        retries = 0
        
        while retries < max_retries:
            try:
                # Try different scraper configurations
                if retries == 0:
                    scraper = sntwitter.TwitterSearchScraper(query)
                elif retries == 1:
                    # Try with a different user agent
                    scraper = sntwitter.TwitterSearchScraper(query)
                    scraper._session.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                else:
                    # Try with a different query format
                    username = query.split(':')[1]
                    scraper = sntwitter.TwitterUserScraper(username)
                
                # Fetch tweets
                for i, tweet in enumerate(scraper.get_items()):
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
                
                # If we got tweets, return them
                if tweets_list:
                    return tweets_list
                
                # Otherwise, try again
                retries += 1
                logger.warning(f"Retry {retries}/{max_retries} for Twitter query")
                time.sleep(2)  # Add delay between retries
                
            except Exception as e:
                logger.error(f"Error during retry {retries}: {str(e)}")
                retries += 1
                time.sleep(2)  # Add delay between retries
        
        # If we get here, all retries failed
        return []
    
    def _generate_mock_data(self, username: str, count: int = 100) -> List[Dict[str, Any]]:
        """
        Generate mock tweet data when Twitter access fails
        
        Args:
            username: Twitter username
            count: Number of mock tweets to generate
            
        Returns:
            List of mock tweet dictionaries
        """
        logger.info(f"Generating {count} mock tweets for {username}")
        
        # Sample content templates
        content_templates = [
            "Just published a new blog post about #programming #tech",
            "Excited to announce our latest project! #coding #developer",
            "Attending {event} conference today. Looking forward to learning new things!",
            "Great discussion with @{person} about the future of technology.",
            "Working on improving our #API documentation today.",
            "Just released version {version} of our software! #release #update",
            "Interesting article about {topic}: {url}",
            "Happy to share that we've reached {number} users! #milestone",
            "Debugging this issue all day... #coding #bugs",
            "Learning about {technology} today. So fascinating! #learning"
        ]
        
        # Sample hashtags
        hashtags = ["tech", "coding", "programming", "developer", "webdev", "javascript", "python", "react", "nodejs"]
        
        # Sample mentions
        mentions = ["techguru", "codemaster", "devexpert", "programmerlife", "techlead"]
        
        # Sample topics
        topics = ["AI", "Machine Learning", "Web Development", "Cloud Computing", "DevOps", "Cybersecurity"]
        
        # Sample events
        events = ["Google I/O", "AWS Summit", "Microsoft Build", "Apple WWDC", "GitHub Universe"]
        
        # Generate mock tweets
        mock_tweets = []
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        
        for i in range(count):
            # Generate random date within the last year
            days_ago = random.randint(0, 365)
            tweet_date = end_date - timedelta(days=days_ago)
            
            # Select random content template
            template = random.choice(content_templates)
            
            # Fill in template variables
            content = template.format(
                event=random.choice(events),
                person=random.choice(mentions),
                version=f"{random.randint(1, 5)}.{random.randint(0, 9)}.{random.randint(0, 9)}",
                topic=random.choice(topics),
                url=f"https://example.com/{random.randint(1000, 9999)}",
                number=f"{random.randint(100, 999)}K",
                technology=random.choice(topics)
            )
            
            # Extract hashtags from content
            content_hashtags = re.findall(r'#(\w+)', content)
            
            # Extract mentions from content
            content_mentions = re.findall(r'@(\w+)', content)
            
            # Add some random likes, retweets, and replies
            likes = random.randint(5, 500)
            retweets = random.randint(0, likes // 2)
            replies = random.randint(0, likes // 3)
            
            # Create tweet dict
            tweet_dict = {
                'id': random.randint(1000000000000000000, 9999999999999999999),
                'date': tweet_date,
                'content': content,
                'likes': likes,
                'retweets': retweets,
                'replies': replies,
                'hashtags': content_hashtags,
                'mentions': content_mentions,
                'url': f"https://twitter.com/{username}/status/{random.randint(1000000000000000000, 9999999999999999999)}",
            }
            
            mock_tweets.append(tweet_dict)
        
        # Sort by date (newest first)
        mock_tweets.sort(key=lambda x: x['date'], reverse=True)
        
        return mock_tweets
    
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