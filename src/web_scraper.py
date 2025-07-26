import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebScraper:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
    
    async def __aenter__(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.firefox.launch(headless=True)
        self.context = await self.browser.new_context()
        self.page = await self.context.new_page()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    async def scrape_page(self, url: str) -> Dict:
        """
        Scrape comprehensive content from a webpage.
        
        Args:
            url (str): The URL to scrape
            
        Returns:
            Dict: Extracted content including text, links, forms, images, etc.
        """
        try:
            logger.info(f"Starting to scrape: {url}")
            
            # Navigate to the page
            await self.page.goto(url, wait_until="networkidle", timeout=30000)
            
            # Wait a bit for dynamic content
            await self.page.wait_for_timeout(2000)
            
            # Basic page information
            page_info = {
                "url": url,
                "final_url": self.page.url,
                "title": await self.page.title(),
                "timestamp": None,
                "status": "success"
            }
            
            # Get page content
            html_content = await self.page.content()
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract text content
            text_content = self._extract_text_content(soup)
            
            # Extract links
            links = await self._extract_links(soup, url)
            
            # Extract forms and inputs
            forms = await self._extract_forms()
            
            # Extract images
            images = self._extract_images(soup, url)
            
            # Extract tables
            tables = self._extract_tables(soup)
            
            # Extract meta information
            meta_info = self._extract_meta_info(soup)
            
            # Check for common elements
            navigation = self._extract_navigation(soup)
            
            # Take screenshot
            screenshot_path = f"screenshot_{urlparse(url).netloc}_{hash(url) % 10000}.png"
            await self.page.screenshot(path=screenshot_path)
            
            # Compile results
            result = {
                **page_info,
                "content": {
                    "text": text_content,
                    "links": links,
                    "forms": forms,
                    "images": images,
                    "tables": tables,
                    "navigation": navigation
                },
                "meta": meta_info,
                "screenshot": screenshot_path,
                "statistics": {
                    "total_links": len(links),
                    "total_forms": len(forms),
                    "total_images": len(images),
                    "total_tables": len(tables),
                    "text_length": len(text_content.get("full_text", ""))
                }
            }
            
            logger.info(f"Successfully scraped {url}")
            return result
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            return {
                "url": url,
                "status": "error",
                "error": str(e),
                "content": {},
                "meta": {},
                "statistics": {}
            }
    
    def _extract_text_content(self, soup: BeautifulSoup) -> Dict:
        """Extract various text content from the page."""
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get main text content
        full_text = soup.get_text()
        clean_text = re.sub(r'\s+', ' ', full_text).strip()
        
        # Extract headings
        headings = []
        for i in range(1, 7):
            for heading in soup.find_all(f'h{i}'):
                headings.append({
                    "level": i,
                    "text": heading.get_text().strip()
                })
        
        # Extract paragraphs
        paragraphs = [p.get_text().strip() for p in soup.find_all('p') if p.get_text().strip()]
        
        # Extract lists
        lists = []
        for ul in soup.find_all(['ul', 'ol']):
            list_items = [li.get_text().strip() for li in ul.find_all('li')]
            lists.append({
                "type": ul.name,
                "items": list_items
            })
        
        return {
            "full_text": clean_text,
            "headings": headings,
            "paragraphs": paragraphs,
            "lists": lists
        }
    
    async def _extract_links(self, soup: BeautifulSoup, base_url: str) -> List[Dict]:
        """Extract all links from the page."""
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            absolute_url = urljoin(base_url, href)
            links.append({
                "text": link.get_text().strip(),
                "href": href,
                "absolute_url": absolute_url,
                "is_external": urlparse(absolute_url).netloc != urlparse(base_url).netloc
            })
        return links
    
    async def _extract_forms(self) -> List[Dict]:
        """Extract form information from the page."""
        forms = []
        form_elements = await self.page.query_selector_all('form')
        
        for form in form_elements:
            action = await form.get_attribute('action') or ''
            method = await form.get_attribute('method') or 'GET'
            
            # Get form inputs
            inputs = []
            input_elements = await form.query_selector_all('input, select, textarea')
            
            for input_elem in input_elements:
                input_type = await input_elem.get_attribute('type') or 'text'
                name = await input_elem.get_attribute('name') or ''
                placeholder = await input_elem.get_attribute('placeholder') or ''
                required = await input_elem.get_attribute('required') is not None
                
                inputs.append({
                    "type": input_type,
                    "name": name,
                    "placeholder": placeholder,
                    "required": required
                })
            
            forms.append({
                "action": action,
                "method": method.upper(),
                "inputs": inputs
            })
        
        return forms
    
    def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict]:
        """Extract image information from the page."""
        images = []
        for img in soup.find_all('img'):
            src = img.get('src', '')
            alt = img.get('alt', '')
            if src:
                absolute_url = urljoin(base_url, src)
                images.append({
                    "src": src,
                    "absolute_url": absolute_url,
                    "alt": alt
                })
        return images
    
    def _extract_tables(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract table data from the page."""
        tables = []
        for table in soup.find_all('table'):
            rows = []
            for tr in table.find_all('tr'):
                cells = [td.get_text().strip() for td in tr.find_all(['td', 'th'])]
                if cells:
                    rows.append(cells)
            
            if rows:
                tables.append({
                    "headers": rows[0] if rows else [],
                    "rows": rows[1:] if len(rows) > 1 else [],
                    "total_rows": len(rows)
                })
        
        return tables
    
    def _extract_meta_info(self, soup: BeautifulSoup) -> Dict:
        """Extract meta information from the page."""
        meta_info = {}
        
        # Meta tags
        for meta in soup.find_all('meta'):
            name = meta.get('name') or meta.get('property') or meta.get('http-equiv')
            content = meta.get('content')
            if name and content:
                meta_info[name] = content
        
        # Title
        title_tag = soup.find('title')
        if title_tag:
            meta_info['title'] = title_tag.get_text().strip()
        
        return meta_info
    
    def _extract_navigation(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract navigation elements from the page."""
        nav_elements = []
        
        # Look for nav tags
        for nav in soup.find_all('nav'):
            nav_links = []
            for link in nav.find_all('a', href=True):
                nav_links.append({
                    "text": link.get_text().strip(),
                    "href": link['href']
                })
            
            if nav_links:
                nav_elements.append({
                    "type": "nav",
                    "links": nav_links
                })
        
        # Look for common navigation patterns
        for element in soup.find_all(['ul', 'ol'], class_=re.compile(r'nav|menu|breadcrumb', re.I)):
            nav_links = []
            for link in element.find_all('a', href=True):
                nav_links.append({
                    "text": link.get_text().strip(),
                    "href": link['href']
                })
            
            if nav_links:
                nav_elements.append({
                    "type": "menu",
                    "links": nav_links
                })
        
        return nav_elements


async def scrape_url(url: str) -> Dict:
    """
    Convenience function to scrape a single URL.
    
    Args:
        url (str): The URL to scrape
        
    Returns:
        Dict: Scraped content and metadata
    """
    async with WebScraper() as scraper:
        return await scraper.scrape_page(url) 