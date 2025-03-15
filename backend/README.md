# TweetX Backend

A FastAPI server that fetches a user's Twitter (X) data using snscrape, processes, stores, and returns advanced Twitter activity stats in an optimized JSON format for a highly interactive frontend dashboard.

## Features

- **Contribution Graph (GitHub-Style for X Posts)**

  - Total tweets per year, month, day
  - Hour-wise distribution
  - Peak activity days
  - Most active months and weeks
  - Activity trend over time
  - GitHub-style contribution heatmap data
  - Streak tracking (current and longest)

- **Engagement Metrics**

  - Total likes, retweets, and estimated impressions
  - Highest performing tweets
  - Engagement trends

- **Hashtags & Mentions Analysis**
  - Top hashtags used
  - Most mentioned users
  - Word cloud for most used words

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Redis**: For caching and performance optimization
- **snscrape**: For fetching Twitter data
- **Pandas**: For data processing and analysis
- **Docker**: For containerization and deployment

## Getting Started

### Prerequisites

- Python 3.8+
- Docker and Docker Compose (optional)
- Redis

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/tweetx.git
   cd tweetx/backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables (copy .env.example to .env and modify as needed)

### Running the Application

#### Using Python directly:

```bash
uvicorn app.main:app --reload
```

#### Using Docker:

```bash
docker-compose up -d
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

- `POST /api/v1/twitter/stats`: Get comprehensive Twitter stats for a username
- `POST /api/v1/twitter/refresh`: Force refresh Twitter stats for a username (bypass cache)
- `GET /api/v1/twitter/health`: Health check endpoint

## Caching Strategy

The API uses Redis to cache computed stats for 15 minutes to avoid re-fetching and re-processing data for the same username. This significantly improves performance for repeated requests.

## Deployment

The application can be deployed to various platforms:

### Render.com (Recommended)

We provide a `render.yaml` Blueprint for easy deployment to Render.com. See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions.

### Fly.io

For deployment to Fly.io, we provide configuration files and a deployment script. See [FLY_DEPLOYMENT.md](FLY_DEPLOYMENT.md) for detailed instructions.

### Other Platforms

The application can also be deployed to other platforms that support Docker containers, such as:

- AWS ECS
- Google Cloud Run
- Heroku

## License

This project is licensed under the MIT License - see the LICENSE file for details.
