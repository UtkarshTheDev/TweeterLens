# Deploying TweetX Monorepo

This guide explains how to deploy the TweetX monorepo with the backend on Render.com and the frontend on Vercel.

## Backend Deployment (Render.com)

### Prerequisites

- A Render.com account (sign up at https://render.com)
- Git repository with your TweetX monorepo code

### Deployment Steps

#### Option 1: One-Click Deployment with Blueprint (Recommended)

The monorepo includes a `render.yaml` Blueprint file in the root directory that automatically configures the backend services.

1. Fork the TweetX repository to your GitHub account.
2. Log in to your Render.com account.
3. Go to the Dashboard and click on "New" and select "Blueprint".
4. Connect your GitHub account if you haven't already.
5. Select your forked TweetX repository.
6. Render will automatically detect the `render.yaml` file in the root directory and set up the services:
   - Backend (FastAPI)
   - Redis
7. Click "Apply" to start the deployment.

#### Option 2: Manual Deployment

If you prefer to deploy services manually:

##### Step 1: Deploy Redis

1. Log in to your Render.com account.
2. Go to the Dashboard and click on "New" and select "Redis".
3. Enter the following details:
   - Name: `tweetx-redis`
   - Region: Choose the region closest to your users
   - Plan: Free
4. Click "Create Redis" to create the Redis instance.
5. Once created, note down the Redis connection details (host, port, and password).

##### Step 2: Deploy the Backend

1. Go to the Dashboard and click on "New" and select "Web Service".
2. Connect your GitHub account if you haven't already.
3. Select your TweetX repository.
4. Enter the following details:
   - Name: `tweetx-backend`
   - Region: Choose the same region as your Redis instance
   - Branch: `main` (or your default branch)
   - Root Directory: `backend` (specify the backend subdirectory)
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

### Verifying the Backend Deployment

Once the deployment is complete, you can verify that the backend is working correctly by accessing the health endpoint:

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

## Frontend Deployment (Vercel)

### Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Git repository with your TweetX monorepo code

### Deployment Steps

1. Log in to your Vercel account.
2. Click on "Add New..." and select "Project".
3. Import your Git repository.
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add the following environment variables:
   - `NEXT_PUBLIC_API_URL`: The URL of your backend service (e.g., `https://tweetx-backend.onrender.com/api/v1`)
   - `NEXT_PUBLIC_ENV`: `production`
6. Click "Deploy" to start the deployment.

### Verifying the Frontend Deployment

Once the deployment is complete, you can access your frontend application at the URL provided by Vercel (typically `https://your-project-name.vercel.app`).

## Connecting Frontend and Backend

To ensure your frontend can communicate with your backend:

1. Make sure the backend's CORS settings allow requests from your Vercel domain.
2. Set the correct `NEXT_PUBLIC_API_URL` environment variable in your Vercel project settings.

## Troubleshooting

### Backend (Render.com) Issues

If you encounter any issues with the backend deployment, check the logs in the Render.com dashboard for error messages. Common issues include:

1. **Redis Connection Issues**: Make sure the Redis connection details are correct.
2. **Missing Dependencies**: Ensure all required packages are listed in requirements.txt.
3. **Environment Variables**: Verify that all required environment variables are set correctly.

### Frontend (Vercel) Issues

If you encounter any issues with the frontend deployment, check the build logs in the Vercel dashboard. Common issues include:

1. **Build Errors**: Check for any errors during the build process.
2. **API Connection**: Ensure the `NEXT_PUBLIC_API_URL` is correctly set and accessible.
3. **CORS Issues**: Make sure the backend allows requests from your Vercel domain.

For more help, refer to the [Render.com documentation](https://render.com/docs) or [Vercel documentation](https://vercel.com/docs).
