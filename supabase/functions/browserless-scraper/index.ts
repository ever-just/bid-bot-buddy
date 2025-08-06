
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeResult {
  status: 'success' | 'error';
  url: string;
  final_url?: string;
  title?: string;
  content?: {
    text: {
      full_text: string;
      headings: Array<{ level: number; text: string }>;
      paragraphs: string[];
      lists: Array<{ type: string; items: string[] }>;
    };
    links: Array<{
      text: string;
      href: string;
      absolute_url: string;
      is_external: boolean;
    }>;
    forms: Array<{
      action: string;
      method: string;
      inputs: Array<{
        type: string;
        name: string;
        placeholder: string;
        required: boolean;
      }>;
    }>;
    images: Array<{
      src: string;
      absolute_url: string;
      alt: string;
    }>;
    tables: Array<{
      headers: string[];
      rows: string[][];
      total_rows: number;
    }>;
    navigation: Array<{
      type: string;
      links: Array<{ text: string; href: string }>;
    }>;
  };
  meta?: Record<string, string>;
  screenshot?: string;
  statistics?: {
    total_links: number;
    total_forms: number;
    total_images: number;
    total_tables: number;
    text_length: number;
  };
  error?: string;
}

async function scrapeWithBrowserQL(url: string, apiKey: string): Promise<ScrapeResult> {
  console.log('🚀 Starting BrowserQL scraping for:', url);
  
  try {
    // Use the correct modern BrowserQL endpoint
    const browserqlUrl = 'https://production-sfo.browserless.io/function';
    
    // Modern JavaScript function for comprehensive content extraction
    const functionCode = `
export default async ({ page, context }) => {
  console.log('🌐 Navigating to URL:', "${url}");
  
  try {
    // Navigate with comprehensive options
    await page.goto("${url}", { 
      waitUntil: 'networkidle2',
      timeout: 45000 
    });
    
    // Wait for initial content load
    await page.waitForTimeout(2000);
    
    // Try to handle authentication barriers intelligently
    try {
      const authElements = await page.$$eval([
        'button:has-text("Guest")',
        'button:has-text("Continue")', 
        'button:has-text("Skip")',
        'a:has-text("Guest")',
        'a:has-text("Continue")',
        '.guest-access',
        '.skip-login',
        '[data-testid*="guest"]',
        '[data-testid*="skip"]',
        'button[title*="guest" i]',
        'a[title*="guest" i]'
      ].join(','), elements => elements.length);
      
      if (authElements > 0) {
        console.log('🔓 Found potential guest access options, attempting click...');
        await page.click('button:has-text("Guest"), a:has-text("Guest"), .guest-access');
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('ℹ️ No guest access elements found or clickable');
    }
    
    // Extract comprehensive page data
    const pageData = await page.evaluate(() => {
      // Clean up scripts and styles for better text extraction
      const scripts = document.querySelectorAll('script, style, noscript');
      scripts.forEach(el => el.remove());
      
      const title = document.title || 'Untitled Page';
      const finalUrl = window.location.href;
      
      // Extract headings with hierarchy
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headings = Array.from(headingElements).map(el => ({
        level: parseInt(el.tagName.charAt(1)),
        text: el.textContent?.trim() || ''
      })).filter(h => h.text.length > 0);
      
      // Extract meaningful paragraphs
      const paragraphElements = document.querySelectorAll('p, .content p, .text, .description');
      const paragraphs = Array.from(paragraphElements)
        .map(el => el.textContent?.trim() || '')
        .filter(text => text.length > 15 && !text.match(/^(\\s|\\n)*$/));
      
      // Extract all links with context
      const linkElements = document.querySelectorAll('a[href]');
      const links = Array.from(linkElements).map(el => {
        const href = el.getAttribute('href') || '';
        const text = el.textContent?.trim() || '';
        let absoluteUrl = href;
        
        try {
          if (!href.startsWith('http') && !href.startsWith('mailto:')) {
            absoluteUrl = href.startsWith('/') 
              ? window.location.origin + href
              : new URL(href, window.location.href).href;
          }
        } catch {
          absoluteUrl = href;
        }
        
        return {
          text: text || href,
          href,
          absolute_url: absoluteUrl,
          is_external: !absoluteUrl.includes(window.location.hostname)
        };
      }).filter(link => 
        link.href && 
        !link.href.startsWith('#') && 
        !link.href.startsWith('javascript:') &&
        link.text.length > 0
      );
      
      // Extract forms with all input details
      const formElements = document.querySelectorAll('form');
      const forms = Array.from(formElements).map(form => {
        const action = form.getAttribute('action') || window.location.href;
        const method = (form.getAttribute('method') || 'GET').toUpperCase();
        
        const inputElements = form.querySelectorAll('input, textarea, select');
        const inputs = Array.from(inputElements).map(input => ({
          type: input.getAttribute('type') || 'text',
          name: input.getAttribute('name') || '',
          placeholder: input.getAttribute('placeholder') || '',
          required: input.hasAttribute('required')
        }));
        
        return { action, method, inputs };
      });
      
      // Extract images with metadata
      const imageElements = document.querySelectorAll('img[src]');
      const images = Array.from(imageElements).map(img => {
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        let absoluteUrl = src;
        
        try {
          if (!src.startsWith('http')) {
            absoluteUrl = src.startsWith('/') 
              ? window.location.origin + src
              : new URL(src, window.location.href).href;
          }
        } catch {
          absoluteUrl = src;
        }
        
        return { src, absolute_url: absoluteUrl, alt };
      }).filter(img => img.src && !img.src.startsWith('data:'));
      
      // Extract table data
      const tableElements = document.querySelectorAll('table');
      const tables = Array.from(tableElements).map(table => {
        const headerElements = table.querySelectorAll('th');
        const headers = Array.from(headerElements).map(th => th.textContent?.trim() || '');
        
        const rowElements = table.querySelectorAll('tbody tr, tr:not(:first-child)');
        const rows = Array.from(rowElements).map(tr => {
          const cellElements = tr.querySelectorAll('td, th');
          return Array.from(cellElements).map(cell => cell.textContent?.trim() || '');
        }).filter(row => row.length > 0 && row.some(cell => cell.length > 0));
        
        return {
          headers,
          rows,
          total_rows: rows.length
        };
      }).filter(table => table.rows.length > 0);
      
      // Extract lists
      const listElements = document.querySelectorAll('ul, ol');
      const lists = Array.from(listElements).map(list => {
        const type = list.tagName.toLowerCase();
        const itemElements = list.querySelectorAll('li');
        const items = Array.from(itemElements)
          .map(li => li.textContent?.trim() || '')
          .filter(item => item.length > 0);
        return { type, items };
      }).filter(list => list.items.length > 0);
      
      // Get clean full text
      const fullText = document.body?.textContent?.replace(/\\s+/g, ' ').trim() || '';
      
      return {
        title,
        finalUrl,
        fullText,
        headings,
        paragraphs,
        links,
        forms,
        images,
        tables,
        lists
      };
    });
    
    return pageData;
    
  } catch (error) {
    console.error('Browser execution error:', error);
    throw new Error(\`Browser execution failed: \${error.message}\`);
  }
};`;

    console.log('📡 Making BrowserQL API request...');
    
    const response = await fetch(browserqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/javascript',
        'Authorization': `Bearer ${apiKey}`,
        'Cache-Control': 'no-cache'
      },
      body: functionCode
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ BrowserQL API error:', errorText);
      
      // Enhanced error handling with specific messages
      if (response.status === 401) {
        throw new Error('BrowserQL authentication failed - check API key');
      } else if (response.status === 402) {
        throw new Error('BrowserQL quota exceeded - upgrade plan needed');
      } else if (response.status === 403) {
        throw new Error('BrowserQL access forbidden - check API permissions');
      } else if (response.status === 429) {
        throw new Error('BrowserQL rate limit exceeded - try again later');
      } else if (response.status === 500) {
        throw new Error('BrowserQL service temporarily unavailable');
      } else {
        throw new Error(`BrowserQL API error: ${response.status} - ${errorText.substring(0, 200)}`);
      }
    }

    const extractedData = await response.json();
    console.log('✅ BrowserQL extraction successful:', {
      title: extractedData.title?.substring(0, 50),
      textLength: extractedData.fullText?.length || 0,
      linksCount: extractedData.links?.length || 0,
      formsCount: extractedData.forms?.length || 0
    });

    // Transform to standard format
    const result: ScrapeResult = {
      status: 'success',
      url: url,
      final_url: extractedData.finalUrl || url,
      title: extractedData.title,
      content: {
        text: {
          full_text: extractedData.fullText || '',
          headings: extractedData.headings || [],
          paragraphs: extractedData.paragraphs || [],
          lists: extractedData.lists || []
        },
        links: extractedData.links || [],
        forms: extractedData.forms || [],
        images: extractedData.images || [],
        tables: extractedData.tables || [],
        navigation: []
      },
      meta: {
        'scraper': 'browserql',
        'scraped_at': new Date().toISOString(),
        'user_agent': 'BrowserQL Chrome',
        'content_length': extractedData.fullText?.length?.toString() || '0',
        'endpoint': 'production-sfo'
      },
      statistics: {
        total_links: extractedData.links?.length || 0,
        total_forms: extractedData.forms?.length || 0,
        total_images: extractedData.images?.length || 0,
        total_tables: extractedData.tables?.length || 0,
        text_length: extractedData.fullText?.length || 0
      }
    };

    // Quality assessment
    const contentQuality = result.statistics!.text_length;
    if (contentQuality < 100) {
      console.log('⚠️ Low content quality detected:', contentQuality, 'characters');
      result.meta = { 
        ...result.meta, 
        'warning': 'Minimal content extracted - possible authentication barrier or dynamic loading' 
      };
    } else if (contentQuality > 1000) {
      console.log('✅ High quality content extracted:', contentQuality, 'characters');
      result.meta = { ...result.meta, 'quality': 'high' };
    }

    return result;

  } catch (error) {
    console.error('❌ BrowserQL scraping failed:', error);
    return {
      status: 'error',
      url,
      error: `BrowserQL failed: ${error.message}`
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ status: 'error', error: 'URL parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('BROWSERLESS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          error: 'BROWSERLESS_API_KEY environment variable not configured' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 Modern BrowserQL scraping initiated for:', url);
    console.log('🔑 API key configured:', apiKey ? 'Yes' : 'No');
    
    const startTime = Date.now();
    const result = await scrapeWithBrowserQL(url, apiKey);
    const duration = Date.now() - startTime;

    // Enhanced result validation and logging
    if (result.status === 'success') {
      const contentLength = result.content?.text?.full_text?.length || 0;
      console.log('📊 Scraping performance metrics:', {
        duration: `${duration}ms`,
        contentLength,
        hasTitle: !!result.title,
        linksFound: result.content?.links?.length || 0,
        formsFound: result.content?.forms?.length || 0,
        headingsFound: result.content?.text?.headings?.length || 0,
        quality: contentLength > 1000 ? 'HIGH' : contentLength > 200 ? 'MEDIUM' : 'LOW'
      });
    } else {
      console.log('❌ Scraping failed after', `${duration}ms:`, result.error);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 BrowserQL scraping system error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        error: `System error: ${error.message}`
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
