#!/bin/bash

MODE=${1: -dev}

if [ "$MODE" == "dev" ]; then
    echo "👨‍💻 Starting in development mode..."
    pnpm run start:dev
    elif [ "$MODE" == "prod" ]; then
    echo "🏭 Starting in production mode..."
    # pnpm run start:prod
else
    echo "❌ Invalid mode. Use dev or prod"
fi
