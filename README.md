# 🕷️ Web Content Scraper

A comprehensive web scraping application built with **Playwright** and **Streamlit** that extracts and analyzes content from any webpage.

## ✨ Features

- **🌐 Universal URL Support**: Works with any website URL
- **📝 Text Extraction**: Extracts headings, paragraphs, lists, and full text content
- **🔗 Link Analysis**: Finds and categorizes internal vs external links
- **📋 Form Detection**: Identifies forms and their input fields
- **🖼️ Image Extraction**: Lists all images with alt text and URLs
- **📊 Table Data**: Extracts and displays tabular data
- **📷 Screenshots**: Captures visual screenshots of pages
- **💾 Data Export**: Download results as JSON files
- **📱 Mobile-Friendly**: Responsive web interface
- **🔄 URL History**: Keeps track of recently scraped URLs

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip

### Installation

1. **Clone or download this project**
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Playwright browsers:**
   ```bash
   python -m playwright install
   ```

### Running the Application

Start the Streamlit web application:

```bash
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`

## 🎯 How to Use

1. **Enter a URL** in the input field (with or without `https://`)
2. **Click "🚀 Scrape Page"** to start the extraction
3. **View Results** organized in tabs:
   - **📝 Text**: Headings, paragraphs, and text content
   - **🔗 Links**: All links found with filtering options
   - **📋 Forms**: Form fields and submission details
   - **🖼️ Images**: Image URLs and alt text
   - **📊 Tables**: Extracted tabular data
   - **📄 Raw Data**: Complete JSON output with download option

## 🛠️ Technical Details

### Architecture

- **Frontend**: Streamlit web interface
- **Backend**: Python with Playwright for web automation
- **Parser**: BeautifulSoup for HTML parsing
- **Browser**: Firefox (headless mode for stability)

### Key Components

- `app.py` - Main Streamlit application
- `web_scraper.py` - Core scraping functionality
- `requirements.txt` - Python dependencies

### Supported Content Types

- ✅ Static HTML content
- ✅ JavaScript-rendered pages (via Playwright)
- ✅ Forms and input fields
- ✅ Tables and structured data
- ✅ Images and media links
- ✅ Navigation menus
- ✅ Meta tags and SEO data

## 📖 Example URLs to Try

- `https://example.com` - Simple test page
- `https://httpbin.org/forms/post` - Form examples
- `https://news.ycombinator.com` - News site with links
- `https://guest.supplier.systems.state.mn.us/psc/fmssupap/SUPPLIER/ERP/c/SCP_PUBLIC_MENU_FL.SCP_PUB_BID_CMP_FL.GBL` - Government procurement site

## 🔧 Configuration

### Browser Settings
The scraper uses Firefox in headless mode by default. You can modify browser settings in `web_scraper.py`:

```python
# Launch Firefox browser in headless mode
browser = await p.firefox.launch(headless=True)
```

### Timeout Settings
Default timeout is 30 seconds for page loads. Adjust in `web_scraper.py`:

```python
await self.page.goto(url, wait_until="networkidle", timeout=30000)
```

## 📊 Output Format

The scraper returns structured data including:

```json
{
  "url": "original_url",
  "final_url": "final_redirected_url",
  "title": "page_title",
  "status": "success",
  "content": {
    "text": {...},
    "links": [...],
    "forms": [...],
    "images": [...],
    "tables": [...],
    "navigation": [...]
  },
  "meta": {...},
  "statistics": {...},
  "screenshot": "screenshot_filename.png"
}
```

## ⚠️ Important Notes

### Rate Limiting
- Be respectful of websites' servers
- Add delays between requests for bulk scraping
- Check robots.txt before scraping

### Legal Considerations
- Ensure you have permission to scrape the target websites
- Respect copyright and terms of service
- Consider data privacy regulations

### CAPTCHA Protection
- Some websites may show CAPTCHA challenges
- The app will detect and report CAPTCHA pages
- Manual intervention may be required for protected sites

## 🐛 Troubleshooting

### Common Issues

**Browser Launch Failed:**
```bash
# Reinstall Playwright browsers
python -m playwright install
```

**Module Not Found:**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

**Timeout Errors:**
- Check your internet connection
- Try a simpler URL first
- Some sites may block automated access

**Permission Denied:**
- Some sites may block scraping
- Try different websites
- Check if the site requires authentication

## 📝 Dependencies

- `playwright==1.40.0` - Web automation and browser control
- `streamlit==1.28.1` - Web application framework
- `beautifulsoup4==4.12.2` - HTML parsing
- `requests==2.31.0` - HTTP library
- `pandas==2.1.4` - Data manipulation and display

## 🤝 Contributing

Feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Scraping!** 🕷️✨ 