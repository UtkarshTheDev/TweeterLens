# Deploying TweetX Backend to Render.com

This guide explains how to deploy the TweetX backend to Render.com with a Redis instance for caching.

## Prerequisites

- A Render.com account (sign up at https://render.com)
- Git repository with your TweetX backend code

## Deployment Steps

### Option 1: One-Click Deployment with Blueprint

1. Fork the TweetX repository to your GitHub account.
2. Log in to your Render.com account.
3. Go to the Dashboard and click on "New" and select "Blueprint".
4. Connect your GitHub account if you haven't already.
5. Select your forked TweetX repository.
6. Render will automatically detect the `render.yaml` file and set up the services.
7. Click "Apply" to start the deployment.

### Option 2: Manual Deployment

#### Step 1: Deploy Redis

1. Log in to your Render.com account.
2. Go to the Dashboard and click on "New" and select "Redis".
3. Enter the following details:
   - Name: `tweetx-redis`
   - Region: Choose the region closest to your users
   - Plan: Free
4. Click "Create Redis" to create the Redis instance.
5. Once created, note down the Redis connection details (host, port, and password).

#### Step 2: Deploy the Backend

1. Go to the Dashboard and click on "New" and select "Web Service".
2. Connect your GitHub account if you haven't already.
3. Select your TweetX repository.
4. Enter the following details:
   - Name: `tweetx-backend`
   - Region: Choose the same region as your Redis instance
   - Branch: `main` (or your default branch)
   - Root Directory: `backend` (if your backend code is in a subdirectory)
   - Runtime: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add the following environment variables:
   - `API_V1_STR`: `/api/v1`
   - `PROJECT_NAME`: `TweetX`
   - `DEBUG`: `false`
   - `REDIS_HOST`: Your Redis host (from Step 1)
   - `REDIS_PORT`: Your Redis port (from Step 1)
   - `REDIS_PASSWORD`: Your Redis password (from Step 1)
   - `REDIS_DB`: `0`
   - `REDIS_CACHE_EXPIRE`: `900`
   - `CELERY_BROKER_URL`: Your Redis connection string (from Step 1)
   - `CELERY_RESULT_BACKEND`: Your Redis connection string (from Step 1)
6. Click "Create Web Service" to deploy the backend.

## Verifying the Deployment

Once the deployment is complete, you can verify that everything is working correctly by accessing the following URL:

```
https://tweetx-backend.onrender.com/api/v1/twitter/health
```

You should see a response like:

```json
{
  "status": "ok",
  "service": "TweetX API"
}
```

## Troubleshooting

If you encounter any issues during deployment, check the logs in the Render.com dashboard for error messages. Common issues include:

1. **Redis Connection Issues**: Make sure the Redis connection details are correct.
2. **Missing Dependencies**: Ensure all required packages are listed in `requirements.txt`.
3. **Environment Variables**: Verify that all required environment variables are set correctly.

For more help, refer to the [Render.com documentation](https://render.com/docs) or contact Render.com support.
