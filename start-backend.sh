
#!/bin/bash

echo "🚀 Starting RFP Analyzer Backend Services..."
echo "=" * 50

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📋 Installing Python dependencies..."
pip install -r requirements.txt

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
python -m playwright install firefox

# Create screenshots directory
echo "📁 Creating screenshots directory..."
mkdir -p screenshots

# Start the Flask backend
echo "🌐 Starting Flask backend on port 8080..."
echo "📝 Backend will be available at: http://localhost:8080"
echo "🔗 Frontend should connect to this backend automatically"
echo "=" * 50

python app.py
