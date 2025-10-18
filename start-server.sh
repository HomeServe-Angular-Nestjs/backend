#!/bin/bash

MODE=${1:-dev}

if [ "$MODE" == "dev" ]; then
    echo "👨‍💻 Starting in development mode..."
    pnpm run start:dev
    elif [ "$MODE" == "prod" ]; then
    echo "🏭 Starting in production mode..."
    # pnpm run start:prod
    elif [ "$MODE" == "tsc" ]; then
    echo "🏭 Checking types..."
    pnpm run tsc:watch
else
    echo "❌ Invalid mode. Use dev, prod or tsc"
fi
