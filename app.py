#!/usr/bin/env python3
"""
Web Content Scraper - Main Flask Application
A comprehensive web scraping tool built with Playwright and Flask
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
import asyncio
import json
import os
from datetime import datetime
import sys

# Add src directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from web_scraper import scrape_url

# Initialize Flask app
app = Flask(__name__, 
           template_folder='templates',
           static_folder='static')

# Configure upload folder for screenshots
app.config['SCREENSHOT_FOLDER'] = os.path.join(os.path.dirname(__file__), 'screenshots')

@app.route('/')
def index():
    """Main page with the scraping form"""
    return render_template('index.html')

@app.route('/api/scrape', methods=['POST'])
def scrape_page():
    """API endpoint to scrape a webpage"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({
                'status': 'error', 
                'error': 'URL is required'
            }), 400
        
        # Add https:// if no protocol
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
        
        # Run the async scraper
        result = asyncio.run(scrape_url(url))
        
        # Move screenshot to proper folder if it exists
        if result.get('screenshot') and os.path.exists(result['screenshot']):
            screenshot_name = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            new_path = os.path.join(app.config['SCREENSHOT_FOLDER'], screenshot_name)
            os.rename(result['screenshot'], new_path)
            result['screenshot'] = f'/screenshots/{screenshot_name}'
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'status': 'error', 
            'error': str(e)
        }), 500

@app.route('/screenshots/<filename>')
def get_screenshot(filename):
    """Serve screenshot files"""
    return send_from_directory(app.config['SCREENSHOT_FOLDER'], filename)

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return render_template('error.html', 
                         error_code=404, 
                         error_message="Page not found"), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return render_template('error.html', 
                         error_code=500, 
                         error_message="Internal server error"), 500

if __name__ == '__main__':
    # Ensure directories exist
    os.makedirs(app.config['SCREENSHOT_FOLDER'], exist_ok=True)
    
    print("🚀 Starting Web Content Scraper...")
    print("🌐 Server will be available at: http://localhost:8080")
    print("📝 Use Ctrl+C to stop the server")
    print("=" * 50)
    
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=False,
        use_reloader=False
    ) 