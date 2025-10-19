#!/bin/bash

# GemiNow Extension Cache Reset Script
# This script clears all caches and resets the extension state

echo "🔄 GemiNow Extension Cache Reset"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "🧹 Clearing build cache..."
rm -rf build/
rm -rf node_modules/.cache/
rm -rf .plasmo/

echo "🗑️ Clearing npm cache..."
npm cache clean --force

echo "📦 Reinstalling dependencies..."
rm -rf node_modules/
rm -f package-lock.json
npm install

echo "🔨 Rebuilding extension..."
npm run build

echo "🧽 Clearing browser storage (if extension is loaded)..."
echo "   Note: You may need to manually clear extension data in Chrome:"
echo "   1. Go to chrome://extensions/"
echo "   2. Find GemiNow extension"
echo "   3. Click 'Details'"
echo "   4. Click 'Storage' and clear all data"
echo ""

echo "🔄 Resetting backend cache..."
if [ -d "backend" ]; then
    cd backend
    echo "   Stopping backend processes..."
    pkill -f "tsx watch src/index.ts" 2>/dev/null || true
    pkill -f "node.*backend" 2>/dev/null || true
    
    echo "   Clearing backend cache..."
    rm -rf node_modules/.cache/ 2>/dev/null || true
    
    echo "   Reinstalling backend dependencies..."
    rm -rf node_modules/ 2>/dev/null || true
    rm -f package-lock.json 2>/dev/null || true
    npm install
    
    echo "   Starting backend..."
    npm run dev &
    cd ..
else
    echo "   Backend directory not found, skipping backend reset"
fi

echo ""
echo "✅ Cache reset complete!"
echo ""
echo "📋 Next steps:"
echo "1. Reload the extension in Chrome (chrome://extensions/)"
echo "2. Make sure backend is running: cd backend && npm run dev"
echo "3. Test the voice functionality"
echo ""
echo "🎉 Extension should now work with a clean state!"
