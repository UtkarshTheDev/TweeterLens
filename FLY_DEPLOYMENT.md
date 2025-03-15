# Deploying TweetX Monorepo to Fly.io

This guide explains how to deploy the TweetX monorepo (both frontend and backend) to Fly.io.

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

# Create the frontend app
flyctl apps create tweetx-frontend
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
cd backend
flyctl deploy --remote-only --app tweetx-backend
```

### Step 8: Set Environment Variables for the Frontend

```bash
flyctl secrets set NEXT_PUBLIC_API_URL="https://tweetx-backend.fly.dev/api/v1" NEXT_PUBLIC_ENV="production" --app tweetx-frontend
```

### Step 9: Deploy the Frontend

```bash
cd frontend
# Create a fly.toml file for the frontend if it doesn't exist
cat > fly.toml << EOL
app = "tweetx-frontend"
primary_region = "sin"  # Change to your preferred region

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3000"
  NODE_ENV = "production"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
EOL

flyctl deploy --remote-only --app tweetx-frontend
```

### Step 10: Verify the Deployment

Once the deployment is complete, you can verify that everything is working correctly:

#### Backend Health Check

Access the backend health endpoint:

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

#### Frontend

Access the frontend application:

```
https://tweetx-frontend.fly.dev
```

You should see the TweetX application interface.

## Using the Deployment Script (Optional)

For convenience, you can create a deployment script that automates the above steps. Here's an example:

```bash
#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment of TweetX to Fly.io...${NC}"

# Generate a random password for Redis
REDIS_PASSWORD=$(openssl rand -base64 24)
echo -e "${GREEN}Generated Redis password.${NC}"

# Deploy Redis first
echo -e "${YELLOW}Deploying Redis to Fly.io...${NC}"
cd "$(dirname "$0")"

# Create Redis volume
echo -e "${YELLOW}Creating Redis volume...${NC}"
flyctl volumes create redis_data --region sin --size 1 --app tweetx-redis || true

# Deploy Redis
echo -e "${YELLOW}Deploying Redis app...${NC}"
cd backend
REDIS_PASSWORD=$REDIS_PASSWORD flyctl deploy --config redis-fly.toml --remote-only --app tweetx-redis

# Set secrets for the backend
echo -e "${YELLOW}Setting up secrets for the backend...${NC}"
flyctl secrets set REDIS_PASSWORD="$REDIS_PASSWORD" --app tweetx-backend

# Deploy the backend
echo -e "${YELLOW}Deploying backend to Fly.io...${NC}"
flyctl deploy --remote-only --app tweetx-backend

# Get backend URL
BACKEND_URL="https://tweetx-backend.fly.dev/api/v1"

# Set secrets for the frontend
echo -e "${YELLOW}Setting up secrets for the frontend...${NC}"
flyctl secrets set NEXT_PUBLIC_API_URL="$BACKEND_URL" NEXT_PUBLIC_ENV="production" --app tweetx-frontend

# Deploy the frontend
echo -e "${YELLOW}Deploying frontend to Fly.io...${NC}"
cd ../frontend
flyctl deploy --remote-only --app tweetx-frontend

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Your TweetX backend is now available at: https://tweetx-backend.fly.dev${NC}"
echo -e "${YELLOW}Your TweetX frontend is now available at: https://tweetx-frontend.fly.dev${NC}"
```

Save this as `deploy-fly.sh` in your root directory and make it executable with `chmod +x deploy-fly.sh`.

## Troubleshooting

If you encounter any issues during deployment, check the logs using:

```bash
# For backend logs
flyctl logs --app tweetx-backend

# For frontend logs
flyctl logs --app tweetx-frontend
```

Common issues include:

1. **Redis Connection Issues**: Make sure the Redis connection details are correct.
2. **Missing Dependencies**: Ensure all required packages are listed in the respective requirements.txt or package.json files.
3. **Environment Variables**: Verify that all required environment variables are set correctly.
4. **Build Errors**: Check for any errors during the build process in the logs.
5. **Cross-Origin Issues**: Ensure the backend CORS settings allow requests from the frontend domain.

For more help, refer to the [Fly.io documentation](https://fly.io/docs) or contact Fly.io support.
