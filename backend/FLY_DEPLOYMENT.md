# Deploying TweetX Backend to Fly.io

This guide explains how to deploy the TweetX backend to Fly.io with a Redis instance for caching.

## Prerequisites

- A Fly.io account (sign up at https://fly.io)
- Fly CLI installed (see installation instructions below)
- Credit card or payment method added to your Fly.io account (required for deployment)

## Installing Fly CLI

### macOS

```bash
brew install flyctl
```

### Linux

```bash
curl -L https://fly.io/install.sh | sh
```

### Windows

```bash
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

## Deployment Steps

### Step 1: Log in to Fly.io

```bash
flyctl auth login
```

This will open a browser window for authentication.

### Step 2: Create the Applications

```bash
# Create the Redis app
flyctl apps create tweetx-redis

# Create the backend app
flyctl apps create tweetx-backend
```

### Step 3: Create a Redis Volume

```bash
flyctl volumes create redis_data --region sin --size 1 --app tweetx-redis
```

Replace `sin` with a region closer to your users if needed.

### Step 4: Generate a Redis Password

```bash
REDIS_PASSWORD=$(openssl rand -base64 24)
```

### Step 5: Deploy Redis

```bash
cd backend
REDIS_PASSWORD=$REDIS_PASSWORD flyctl deploy --config redis-fly.toml --remote-only --app tweetx-redis
```

### Step 6: Set Secrets for the Backend

```bash
flyctl secrets set REDIS_PASSWORD="$REDIS_PASSWORD" --app tweetx-backend
```

### Step 7: Deploy the Backend

```bash
flyctl deploy --remote-only --app tweetx-backend
```

### Step 8: Verify the Deployment

Once the deployment is complete, you can verify that everything is working correctly by accessing the following URL:

```
https://tweetx-backend.fly.dev/api/v1/twitter/health
```

You should see a response like:

```json
{
  "status": "ok",
  "service": "TweetX API"
}
```

## Using the Deployment Script

For convenience, we've provided a deployment script that automates the above steps:

```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

## Troubleshooting

If you encounter any issues during deployment, check the logs using:

```bash
flyctl logs --app tweetx-backend
```

Common issues include:

1. **Redis Connection Issues**: Make sure the Redis connection details are correct.
2. **Missing Dependencies**: Ensure all required packages are listed in `requirements.txt`.
3. **Environment Variables**: Verify that all required environment variables are set correctly.

For more help, refer to the [Fly.io documentation](https://fly.io/docs) or contact Fly.io support.
