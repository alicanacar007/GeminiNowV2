#!/bin/bash

# GemiNow Backend Deployment Script
# This script sets up and deploys the backend service

echo "🚀 GemiNow Backend Deployment Script"
echo "===================================="

# Check if we're in the backend directory
if [ ! -f "package.json" ] || [ ! -f "src/index.ts" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check for required environment variables
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  Warning: GEMINI_API_KEY not set"
    echo "   The backend will run in mock mode"
    echo "   To enable full functionality, set GEMINI_API_KEY in your environment"
    echo ""
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.cache/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the backend
echo "🔨 Building backend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! Check the output above for errors."
    exit 1
fi

echo "✅ Backend built successfully!"
echo ""
echo "🌐 Starting backend server..."
echo "   WebSocket server will be available at: ws://localhost:8080"
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the backend
npm run start
