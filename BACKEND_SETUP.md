
# RFP Analyzer Backend Setup

This guide explains how to set up the Python Flask backend that provides robust web scraping capabilities using Playwright.

## Quick Start

### Option 1: Automatic Setup (Recommended)

**Linux/Mac:**
```bash
./start-backend.sh
```

**Windows:**
```cmd
start-backend.bat
```

### Option 2: Manual Setup

1. **Create and activate virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
python -m playwright install firefox
```

3. **Start the Flask server:**
```bash
python app.py
```

## What This Provides

### Advanced Web Scraping Capabilities
- **Playwright Browser Automation**: Full browser simulation with JavaScript execution
- **Authentication Handling**: Can bypass login pages and cookie requirements
- **Dynamic Content**: Waits for content to load and handles SPA applications
- **Screenshot Capture**: Takes screenshots of scraped pages
- **Comprehensive Extraction**: Text, links, forms, tables, images, navigation

### Integration Points
- **Flask API Endpoint**: `/api/scrape` for the frontend to call
- **Health Check**: `/health` endpoint for monitoring
- **CORS Enabled**: Frontend can communicate with backend
- **Error Handling**: Graceful fallbacks and detailed error messages

## Testing the Backend

1. **Health Check:**
```bash
curl http://localhost:8080/health
```

2. **Test Scraping:**
```bash
curl -X POST http://localhost:8080/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Frontend Integration

The frontend (`src/services/api.ts`) now:
1. **Primary**: Calls the Python Flask backend on `localhost:8080`
2. **Fallback**: Uses Supabase edge functions if backend is unavailable
3. **Automatic**: No configuration needed - just start both services

## Architecture

```
Frontend (React/TypeScript)
    ↓ HTTP requests
Python Flask Backend (app.py)
    ↓ Browser automation
Playwright + Firefox
    ↓ Web scraping
Target RFP websites
```

## Troubleshooting

### Port 8080 Already in Use
```bash
# Find and kill process on port 8080
sudo lsof -ti:8080 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :8080        # Windows
```

### Playwright Installation Issues
```bash
# Reinstall Playwright browsers
python -m playwright install --force firefox
```

### CORS Issues
The backend is configured with CORS enabled for `localhost:3000` and `localhost:5173` (common frontend ports).

## Production Deployment

For production, update the `baseUrl` in `src/services/api.ts` to point to your deployed Python backend URL.

Common deployment platforms for Python Flask apps:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk
