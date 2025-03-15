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

# Create apps if they don't exist
echo -e "${YELLOW}Creating apps if they don't exist...${NC}"
flyctl apps create tweetx-redis 2>/dev/null || true
flyctl apps create tweetx-backend 2>/dev/null || true
flyctl apps create tweetx-frontend 2>/dev/null || true

# Create Redis volume
echo -e "${YELLOW}Creating Redis volume...${NC}"
flyctl volumes create redis_data --region sin --size 1 --app tweetx-redis 2>/dev/null || true

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

# Create fly.toml for frontend if it doesn't exist
if [ ! -f "../frontend/fly.toml" ]; then
  echo -e "${YELLOW}Creating fly.toml for frontend...${NC}"
  cat > ../frontend/fly.toml << EOL
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
  echo -e "${GREEN}Created fly.toml for frontend.${NC}"
fi

# Deploy the frontend
echo -e "${YELLOW}Deploying frontend to Fly.io...${NC}"
cd ../frontend
flyctl deploy --remote-only --app tweetx-frontend

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Your TweetX backend is now available at: https://tweetx-backend.fly.dev${NC}"
echo -e "${YELLOW}Your TweetX frontend is now available at: https://tweetx-frontend.fly.dev${NC}" 