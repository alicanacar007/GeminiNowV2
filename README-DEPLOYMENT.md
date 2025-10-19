# GemiNow Deployment Guide

This guide helps you deploy and troubleshoot the GemiNow extension.

## 🚀 Quick Deployment

### 1. Deploy Extension
```bash
# Make scripts executable
chmod +x deploy.sh reset-cache.sh

# Deploy the extension
./deploy.sh
```

### 2. Deploy Backend
```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Manual Deployment

### Extension Deployment
```bash
# Clean and build
npm install
npm run build

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select "build/chrome-mv3-prod" folder
```

### Backend Deployment
```bash
cd backend
npm install
npm run dev  # Development mode
# OR
npm run build && npm start  # Production mode
```

## 🧹 Cache Reset & Troubleshooting

### Full Reset
```bash
# Reset everything (extension + backend)
./reset-cache.sh
```

### Extension Cache Only
```bash
# Clear extension cache
rm -rf build/ node_modules/.cache/ .plasmo/
npm cache clean --force
npm install
npm run build
```

### Backend Cache Only
```bash
cd backend
rm -rf dist/ node_modules/.cache/
npm cache clean --force
npm install
npm run build
```

### Clear Extension Data
```bash
# Clear extension storage data
# Run this in Chrome DevTools console on the extension popup:
# Or use the clear-extension-data.js script
```

## 🔍 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend is running: `curl -I http://localhost:8080`
   - Verify port 8080 is not blocked
   - Check firewall settings

2. **Microphone Permission Denied**
   - Clear extension data and reload
   - Check Chrome microphone permissions
   - Try the permission tab: `tabs/permission.html`

3. **Build Errors**
   - Run `./reset-cache.sh` for a clean build
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed

4. **Audio Not Playing**
   - Check browser audio permissions
   - Verify TTS API key is set
   - Check browser console for errors

### Environment Variables

Create `.env` file in project root:
```bash
PLASMO_PUBLIC_WS_URL=ws://localhost:8080
GEMINI_MODEL=gemini-2.5-flash
```

Create `.env` file in backend directory:
```bash
GEMINI_API_KEY=your_api_key_here
WS_PORT=8080
GEMINI_MODEL=gemini-2.5-flash
```

## 📁 File Structure

```
GemiNow-Ali/
├── deploy.sh                 # Extension deployment script
├── reset-cache.sh            # Full cache reset script
├── clear-extension-data.js   # Extension data clearer
├── backend/
│   └── deploy.sh            # Backend deployment script
├── build/
│   └── chrome-mv3-prod/     # Built extension files
└── README-DEPLOYMENT.md     # This file
```

## 🎯 Production Deployment

### Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Other Platforms
- **Render**: Connect GitHub repo, set build command
- **Heroku**: Use Node.js buildpack
- **Vercel**: Deploy as serverless function

## 🔐 Security Notes

- Never commit `.env` files
- Use environment variables for API keys
- Set up proper CORS for production
- Use HTTPS in production

## 📞 Support

If you encounter issues:
1. Check the console logs
2. Run `./reset-cache.sh`
3. Verify all dependencies are installed
4. Check the backend is running
5. Verify WebSocket connection

---

**Happy Deploying! 🚀**
