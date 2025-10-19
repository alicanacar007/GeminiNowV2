#!/bin/bash

# GemiNow Extension Deployment Script
# This script builds the extension and prepares it for deployment

echo "🚀 GemiNow Extension Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build/
rm -rf node_modules/.cache/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the extension
echo "🔨 Building extension..."
npm run build

# Check if build was successful
if [ ! -d "build/chrome-mv3-prod" ]; then
    echo "❌ Build failed! Check the output above for errors."
    exit 1
fi

echo "✅ Extension built successfully!"
echo ""
echo "📁 Extension files are in: build/chrome-mv3-prod/"
echo ""
echo "🔧 To load the extension in Chrome:"
echo "1. Open chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select the 'build/chrome-mv3-prod' folder"
echo ""
echo "🌐 Make sure the backend is running on ws://localhost:8080"
echo "   Run: cd backend && npm run dev"
echo ""
echo "🎉 Deployment ready!"
