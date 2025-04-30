#!/bin/bash

echo "🔍 Listing contents of /app:"
ls -la /app

# Source the .env file to load environment variables
# Ensure the .env file is in the same directory as this script
# if [ -f .env ]; then
#   export $(grep -v '^#' .env | xargs)
# fi
if [ -f /app/.env ]; then
  set -a
  source /app/.env
  set +a
fi

# Conditionally run start or dev command based on MODE value
echo "🚀 Starting Next.js server..."
if [ "$MODE" = "PRODUCTION" ]; then
  node server.js
else
  yarn run dev
fi

# Execute any additional commands passed to the script
exec "$@"
