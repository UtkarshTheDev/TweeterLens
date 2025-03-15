#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment of TweetX backend to Fly.io...${NC}"

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
REDIS_PASSWORD=$REDIS_PASSWORD flyctl deploy --config redis-fly.toml --remote-only

# Get Redis internal address
echo -e "${GREEN}Redis deployed successfully!${NC}"
echo -e "${YELLOW}Setting up secrets for the backend...${NC}"

# Set secrets for the backend
flyctl secrets set REDIS_PASSWORD="$REDIS_PASSWORD" --app tweetx-backend

# Deploy the backend
echo -e "${YELLOW}Deploying backend to Fly.io...${NC}"
flyctl deploy --remote-only

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Your TweetX backend is now available at: https://tweetx-backend.fly.dev${NC}" 