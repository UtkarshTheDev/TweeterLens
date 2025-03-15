import pandas as pd
import numpy as np
from collections import Counter
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
import re
import nltk
from nltk.corpus import stopwords
import logging
from app.services.twitter_fetcher import TwitterFetcher

# Download NLTK resources
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

logger = logging.getLogger(__name__)

class TwitterAnalyzer:
    """Service to analyze Twitter data and generate stats"""
    
    def __init__(self, tweets_data: List[Dict[str, Any]] = None):
        self.fetcher = TwitterFetcher()
        if tweets_data:
            self.tweets = tweets_data
            self.df = pd.DataFrame(tweets_data)
        else:
            self.tweets = []
            self.df = pd.DataFrame()
    
    def load_tweets(self, username: str, limit: int = 1000):
        """Load tweets for a username"""
        self.tweets = self.fetcher.fetch_user_tweets(username, limit)
        if self.tweets:
            self.df = pd.DataFrame(self.tweets)
            # Convert date to datetime if it's not already
            if 'date' in self.df.columns and not pd.api.types.is_datetime64_any_dtype(self.df['date']):
                self.df['date'] = pd.to_datetime(self.df['date'])
        return self.tweets
    
    def analyze_all(self) -> Dict[str, Any]:
        """Generate all stats and metrics"""
        if self.df.empty:
            return {"error": "No tweets data available for analysis"}
        
        try:
            # Prepare data
            self.df['year'] = self.df['date'].dt.year
            self.df['month'] = self.df['date'].dt.month
            self.df['day'] = self.df['date'].dt.day
            self.df['hour'] = self.df['date'].dt.hour
            self.df['day_of_week'] = self.df['date'].dt.dayofweek
            self.df['week'] = self.df['date'].dt.isocalendar().week
            
            # Calculate estimated impressions
            self.df['impressions'] = self.df.apply(
                lambda row: self.fetcher.estimate_impressions(
                    row['likes'], row['retweets'], row['replies']
                ), 
                axis=1
            )
            
            # Generate all stats
            contribution_stats = self.get_contribution_stats()
            engagement_stats = self.get_engagement_stats()
            hashtags_mentions = self.get_hashtags_mentions_stats()
            
            # Combine all stats
            all_stats = {
                "contribution": contribution_stats,
                "engagement": engagement_stats,
                "hashtags_mentions": hashtags_mentions,
                "total_tweets": len(self.df),
                "date_range": {
                    "start": self.df['date'].min().isoformat(),
                    "end": self.df['date'].max().isoformat()
                }
            }
            
            return all_stats
            
        except Exception as e:
            logger.error(f"Error analyzing tweets: {str(e)}")
            return {"error": f"Failed to analyze tweets: {str(e)}"}
    
    def generate_github_style_contribution_data(self) -> List[Dict[str, Any]]:
        """
        Generate data specifically formatted for a GitHub-style contribution graph
        
        Returns a list of objects with date and count for the last 365 days
        """
        if self.df.empty:
            return []
        
        # Get the date range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=365)
        
        # Create a date range for the last 365 days
        date_range = pd.date_range(start=start_date, end=end_date)
        
        # Create a DataFrame with all dates in the range
        all_dates_df = pd.DataFrame({'date': date_range})
        all_dates_df['date_only'] = all_dates_df['date'].dt.date
        
        # Count tweets per day
        tweets_per_day = self.df.groupby(self.df['date'].dt.date).size().reset_index()
        tweets_per_day.columns = ['date', 'count']
        
        # Merge with all dates to include days with zero tweets
        merged_df = pd.merge(all_dates_df, tweets_per_day, left_on='date_only', right_on='date', how='left')
        merged_df['count'] = merged_df['count'].fillna(0).astype(int)
        merged_df = merged_df[['date_only', 'count']]
        merged_df.columns = ['date', 'count']
        
        # Convert to list of dictionaries
        contribution_data = []
        for _, row in merged_df.iterrows():
            contribution_data.append({
                "date": str(row['date']),
                "count": int(row['count']),
                "level": self._get_activity_level(row['count'])
            })
        
        return contribution_data
    
    def _get_activity_level(self, count: int) -> int:
        """
        Convert tweet count to an activity level (0-4) for the contribution graph
        
        0: No tweets
        1: Low activity (1-2 tweets)
        2: Medium activity (3-5 tweets)
        3: High activity (6-9 tweets)
        4: Very high activity (10+ tweets)
        """
        if count == 0:
            return 0
        elif count <= 2:
            return 1
        elif count <= 5:
            return 2
        elif count <= 9:
            return 3
        else:
            return 4
    
    def get_contribution_stats(self) -> Dict[str, Any]:
        """Get contribution graph stats (GitHub-style)"""
        # 1. Total tweets per year
        tweets_per_year = self.df.groupby('year').size().to_dict()
        
        # 2. Total tweets per month (for heatmap)
        tweets_per_month = self.df.groupby(['year', 'month']).size().reset_index()
        tweets_per_month.columns = ['year', 'month', 'count']
        tweets_per_month_dict = tweets_per_month.to_dict('records')
        
        # 3. Total tweets per day
        tweets_per_day = self.df.groupby(self.df['date'].dt.date).size().reset_index()
        tweets_per_day.columns = ['date', 'count']
        tweets_per_day_dict = {
            str(date): count for date, count in zip(tweets_per_day['date'], tweets_per_day['count'])
        }
        
        # 4. Hour-wise distribution
        hour_distribution = self.df.groupby('hour').size().to_dict()
        
        # 5. Day with highest tweets
        if not tweets_per_day.empty:
            max_day = tweets_per_day.loc[tweets_per_day['count'].idxmax()]
            peak_day = {
                "date": str(max_day['date']),
                "count": int(max_day['count'])
            }
        else:
            peak_day = {"date": None, "count": 0}
        
        # 6. Most active months and weeks
        active_months = self.df.groupby(['year', 'month']).size().reset_index()
        active_months.columns = ['year', 'month', 'count']
        active_months = active_months.sort_values('count', ascending=False).head(5).to_dict('records')
        
        active_weeks = self.df.groupby(['year', 'week']).size().reset_index()
        active_weeks.columns = ['year', 'week', 'count']
        active_weeks = active_weeks.sort_values('count', ascending=False).head(5).to_dict('records')
        
        # 7. Tweet activity over time (monthly trend)
        activity_trend = self.df.set_index('date').resample('M')['id'].count().reset_index()
        activity_trend.columns = ['date', 'count']
        activity_trend_dict = {
            str(date.date()): count for date, count in zip(activity_trend['date'], activity_trend['count'])
        }
        
        # Generate GitHub-style contribution data
        github_contribution_data = self.generate_github_style_contribution_data()
        
        # Calculate streak data
        current_streak, longest_streak = self._calculate_streaks(github_contribution_data)
        
        # Calculate weekly distribution
        day_of_week_distribution = self.df.groupby('day_of_week').size().reset_index()
        day_of_week_distribution.columns = ['day_of_week', 'count']
        day_of_week_dict = {
            int(day): int(count) for day, count in zip(day_of_week_distribution['day_of_week'], day_of_week_distribution['count'])
        }
        
        return {
            "tweets_per_year": tweets_per_year,
            "tweets_per_month": tweets_per_month_dict,
            "tweets_per_day": tweets_per_day_dict,
            "hour_distribution": hour_distribution,
            "peak_day": peak_day,
            "most_active_months": active_months,
            "most_active_weeks": active_weeks,
            "activity_trend": activity_trend_dict,
            "github_contribution_data": github_contribution_data,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "day_of_week_distribution": day_of_week_dict
        }
    
    def _calculate_streaks(self, contribution_data: List[Dict[str, Any]]) -> Tuple[int, int]:
        """
        Calculate current and longest streaks from contribution data
        
        Returns:
            Tuple of (current_streak, longest_streak)
        """
        if not contribution_data:
            return 0, 0
        
        # Sort by date
        sorted_data = sorted(contribution_data, key=lambda x: x['date'])
        
        current_streak = 0
        longest_streak = 0
        streak = 0
        
        # Calculate streaks
        for item in reversed(sorted_data):
            if item['count'] > 0:
                streak += 1
            else:
                if streak > longest_streak:
                    longest_streak = streak
                streak = 0
        
        # Update longest streak if the current streak is longer
        if streak > longest_streak:
            longest_streak = streak
        
        current_streak = streak
        
        return current_streak, longest_streak
    
    def get_engagement_stats(self) -> Dict[str, Any]:
        """Get engagement metrics stats"""
        if self.df.empty:
            return {}
        
        # 8. Total likes received
        total_likes = int(self.df['likes'].sum())
        
        # 9. Total reposts (retweets) received
        total_retweets = int(self.df['retweets'].sum())
        
        # 10. Total estimated impressions
        total_impressions = int(self.df['impressions'].sum())
        
        # 11. Tweet with highest impressions
        max_impressions_idx = self.df['impressions'].idxmax()
        highest_impressions_tweet = self.df.loc[max_impressions_idx].to_dict()
        highest_impressions_tweet['date'] = str(highest_impressions_tweet['date'])
        
        # 12. Tweet with highest likes
        max_likes_idx = self.df['likes'].idxmax()
        highest_likes_tweet = self.df.loc[max_likes_idx].to_dict()
        highest_likes_tweet['date'] = str(highest_likes_tweet['date'])
        
        # 13. Tweet with highest retweets
        max_retweets_idx = self.df['retweets'].idxmax()
        highest_retweets_tweet = self.df.loc[max_retweets_idx].to_dict()
        highest_retweets_tweet['date'] = str(highest_retweets_tweet['date'])
        
        # 14. Tweet with highest replies
        max_replies_idx = self.df['replies'].idxmax()
        highest_replies_tweet = self.df.loc[max_replies_idx].to_dict()
        highest_replies_tweet['date'] = str(highest_replies_tweet['date'])
        
        # Calculate engagement rate
        total_tweets = len(self.df)
        avg_likes = total_likes / total_tweets if total_tweets > 0 else 0
        avg_retweets = total_retweets / total_tweets if total_tweets > 0 else 0
        
        # Likes trend over time (monthly)
        likes_trend = self.df.set_index('date').resample('M')['likes'].sum().reset_index()
        likes_trend.columns = ['date', 'likes']
        likes_trend_dict = {
            str(date.date()): likes for date, likes in zip(likes_trend['date'], likes_trend['likes'])
        }
        
        # Impressions trend over time (monthly)
        impressions_trend = self.df.set_index('date').resample('M')['impressions'].sum().reset_index()
        impressions_trend.columns = ['date', 'impressions']
        impressions_trend_dict = {
            str(date.date()): impressions for date, impressions in zip(impressions_trend['date'], impressions_trend['impressions'])
        }
        
        # Best time to post (hour with highest average engagement)
        hour_engagement = self.df.groupby('hour').agg({
            'likes': 'mean',
            'retweets': 'mean',
            'replies': 'mean',
            'impressions': 'mean'
        }).reset_index()
        
        hour_engagement['total_engagement'] = (
            hour_engagement['likes'] + 
            hour_engagement['retweets'] * 2 + 
            hour_engagement['replies']
        )
        
        best_hours = hour_engagement.sort_values('total_engagement', ascending=False).head(5)
        best_hours_dict = best_hours.to_dict('records')
        
        return {
            "total_likes": total_likes,
            "total_retweets": total_retweets,
            "total_impressions": total_impressions,
            "highest_impressions_tweet": highest_impressions_tweet,
            "highest_likes_tweet": highest_likes_tweet,
            "highest_retweets_tweet": highest_retweets_tweet,
            "highest_replies_tweet": highest_replies_tweet,
            "avg_likes_per_tweet": avg_likes,
            "avg_retweets_per_tweet": avg_retweets,
            "likes_trend": likes_trend_dict,
            "impressions_trend": impressions_trend_dict,
            "best_hours_to_post": best_hours_dict
        }
    
    def get_hashtags_mentions_stats(self) -> Dict[str, Any]:
        """Get hashtags and mentions analysis"""
        if self.df.empty:
            return {}
        
        # 15. Top hashtags used
        all_hashtags = []
        for hashtags in self.df['hashtags']:
            all_hashtags.extend(hashtags)
        
        top_hashtags = Counter(all_hashtags).most_common(20)
        top_hashtags_dict = {tag: count for tag, count in top_hashtags}
        
        # 16. Most mentioned users
        all_mentions = []
        for mentions in self.df['mentions']:
            all_mentions.extend(mentions)
        
        top_mentions = Counter(all_mentions).most_common(20)
        top_mentions_dict = {user: count for user, count in top_mentions}
        
        # 21. Word cloud for most used words
        stop_words = set(stopwords.words('english'))
        all_words = []
        
        for content in self.df['content']:
            # Remove URLs, hashtags, mentions, and special characters
            clean_text = re.sub(r'http\S+|#\w+|@\w+|[^\w\s]', '', content.lower())
            words = clean_text.split()
            # Filter out stop words
            filtered_words = [word for word in words if word not in stop_words and len(word) > 2]
            all_words.extend(filtered_words)
        
        word_counts = Counter(all_words).most_common(100)
        word_cloud_dict = {word: count for word, count in word_counts}
        
        return {
            "top_hashtags": top_hashtags_dict,
            "top_mentions": top_mentions_dict,
            "word_cloud": word_cloud_dict
        } 