
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

// Enhanced user agent rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getEnhancedHeaders(url: string, userAgent: string): Record<string, string> {
  const urlObj = new URL(url);
  return {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Referer': urlObj.origin,
    'Connection': 'keep-alive',
  };
}

function extractTextContent(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHeadings(html: string): Array<{ level: number; text: string }> {
  const headingMatches = Array.from(html.matchAll(/<h([1-6])[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/h[1-6]>/gi));
  return headingMatches.map(match => ({
    level: parseInt(match[1]),
    text: match[2].replace(/<[^>]*>/g, '').trim()
  })).filter(h => h.text.length > 0);
}

function extractParagraphs(html: string): string[] {
  const paragraphMatches = Array.from(html.matchAll(/<p[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/p>/gi));
  return paragraphMatches
    .map(match => match[1].replace(/<[^>]*>/g, '').trim())
    .filter(p => p.length > 20);
}

function extractLists(html: string): Array<{ type: string; items: string[] }> {
  const listMatches = Array.from(html.matchAll(/<([uo]l)[^>]*>([\s\S]*?)<\/\1>/gi));
  return listMatches.map(match => {
    const type = match[1].toLowerCase();
    const listContent = match[2];
    const itemMatches = Array.from(listContent.matchAll(/<li[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/li>/gi));
    const items = itemMatches
      .map(item => item[1].replace(/<[^>]*>/g, '').trim())
      .filter(item => item.length > 0);
    return { type, items };
  }).filter(list => list.items.length > 0);
}

function extractLinks(html: string, baseUrl: string): Array<{
  text: string;
  href: string;
  absolute_url: string;
  is_external: boolean;
}> {
  const linkMatches = Array.from(html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/a>/gi));
  const baseUrlObj = new URL(baseUrl);
  
  return linkMatches
    .map(match => {
      const href = match[1];
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
        return null;
      }
      
      let absolute_url: string;
      try {
        if (href.startsWith('http')) {
          absolute_url = href;
        } else if (href.startsWith('/')) {
          absolute_url = `${baseUrlObj.origin}${href}`;
        } else {
          absolute_url = new URL(href, baseUrl).href;
        }
      } catch {
        return null;
      }
      
      return {
        text: text || href,
        href,
        absolute_url,
        is_external: !absolute_url.includes(baseUrlObj.hostname)
      };
    })
    .filter(link => link !== null);
}

function extractImages(html: string, baseUrl: string): Array<{
  src: string;
  absolute_url: string;
  alt: string;
}> {
  const imageMatches = Array.from(html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi));
  const baseUrlObj = new URL(baseUrl);
  
  return imageMatches
    .map(match => {
      const src = match[1];
      const alt = match[2] || '';
      
      let absolute_url: string;
      try {
        if (src.startsWith('http')) {
          absolute_url = src;
        } else if (src.startsWith('/')) {
          absolute_url = `${baseUrlObj.origin}${src}`;
        } else {
          absolute_url = new URL(src, baseUrl).href;
        }
      } catch {
        return null;
      }
      
      return { src, absolute_url, alt };
    })
    .filter(img => img !== null);
}

function extractForms(html: string, baseUrl: string): Array<{
  action: string;
  method: string;
  inputs: Array<{
    type: string;
    name: string;
    placeholder: string;
    required: boolean;
  }>;
}> {
  const formMatches = Array.from(html.matchAll(/<form[^>]*>([\s\S]*?)<\/form>/gi));
  const baseUrlObj = new URL(baseUrl);
  
  return formMatches.map(match => {
    const formHtml = match[0];
    const formContent = match[1];
    
    // Extract form attributes
    const actionMatch = formHtml.match(/action=["']([^"']+)["']/i);
    const methodMatch = formHtml.match(/method=["']([^"']+)["']/i);
    
    let action = actionMatch ? actionMatch[1] : '';
    if (action && !action.startsWith('http')) {
      try {
        action = action.startsWith('/') 
          ? `${baseUrlObj.origin}${action}`
          : new URL(action, baseUrl).href;
      } catch {
        action = baseUrl;
      }
    }
    
    // Extract inputs
    const inputMatches = Array.from(formContent.matchAll(/<input[^>]*>/gi));
    const inputs = inputMatches.map(inputMatch => {
      const inputHtml = inputMatch[0];
      const typeMatch = inputHtml.match(/type=["']([^"']+)["']/i);
      const nameMatch = inputHtml.match(/name=["']([^"']+)["']/i);
      const placeholderMatch = inputHtml.match(/placeholder=["']([^"']+)["']/i);
      const required = inputHtml.includes('required');
      
      return {
        type: typeMatch ? typeMatch[1] : 'text',
        name: nameMatch ? nameMatch[1] : '',
        placeholder: placeholderMatch ? placeholderMatch[1] : '',
        required
      };
    }).filter(input => input.name);
    
    return {
      action: action || baseUrl,
      method: methodMatch ? methodMatch[1].toUpperCase() : 'GET',
      inputs
    };
  });
}

function extractTables(html: string): Array<{
  headers: string[];
  rows: string[][];
  total_rows: number;
}> {
  const tableMatches = Array.from(html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi));
  
  return tableMatches.map(match => {
    const tableHtml = match[1];
    
    // Extract headers
    const headerMatches = Array.from(tableHtml.matchAll(/<th[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/th>/gi));
    const headers = headerMatches.map(h => h[1].replace(/<[^>]*>/g, '').trim());
    
    // Extract rows
    const rowMatches = Array.from(tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));
    const rows = rowMatches.map(row => {
      const cellMatches = Array.from(row[1].matchAll(/<td[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/td>/gi));
      return cellMatches.map(cell => cell[1].replace(/<[^>]*>/g, '').trim());
    }).filter(row => row.length > 0);
    
    return {
      headers,
      rows,
      total_rows: rows.length
    };
  });
}

function detectAuthenticationBarrier(html: string, textContent: string): { hasBarrier: boolean; reason?: string } {
  const authIndicators = [
    // Login/Authentication
    { pattern: /login|sign in|log in/i, reason: 'Login required' },
    { pattern: /authentication required/i, reason: 'Authentication required' },
    { pattern: /please sign in/i, reason: 'Sign in required' },
    { pattern: /unauthorized|access denied/i, reason: 'Access denied' },
    
    // Subscription/Paywall
    { pattern: /subscribe|subscription/i, reason: 'Subscription required' },
    { pattern: /premium content|paid content/i, reason: 'Premium content' },
    { pattern: /paywall|payment required/i, reason: 'Payment required' },
    
    // Technical barriers
    { pattern: /javascript required|enable javascript/i, reason: 'JavaScript required' },
    { pattern: /cookies required|enable cookies/i, reason: 'Cookies required' },
    { pattern: /captcha|recaptcha/i, reason: 'CAPTCHA required' },
    
    // Bot detection
    { pattern: /bot detected|unusual traffic/i, reason: 'Bot detection' },
    { pattern: /cloudflare|checking your browser/i, reason: 'Security check' },
  ];
  
  for (const indicator of authIndicators) {
    if (indicator.pattern.test(textContent) || indicator.pattern.test(html)) {
      return { hasBarrier: true, reason: indicator.reason };
    }
  }
  
  // Check for minimal content (possible auth barrier)
  if (textContent.length < 200 && html.includes('<form')) {
    return { hasBarrier: true, reason: 'Minimal content with forms detected' };
  }
  
  return { hasBarrier: false };
}

async function enhancedScrapeWithRetry(url: string, maxRetries = 3): Promise<ScrapeResult> {
  console.log('🚀 Enhanced scraping with retry logic for:', url);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}/${maxRetries} for ${url}`);
      
      const userAgent = getRandomUserAgent();
      const headers = getEnhancedHeaders(url, userAgent);
      
      // Add delay between retries
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
      
      const response = await fetch(url, { headers });

      if (!response.ok) {
        if (attempt === maxRetries) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        console.log(`⚠️ HTTP ${response.status}, retrying...`);
        continue;
      }

      const html = await response.text();
      const final_url = response.url;
      
      // Enhanced content extraction
      const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || '';
      const textContent = extractTextContent(html);
      
      // Check for authentication barriers
      const authCheck = detectAuthenticationBarrier(html, textContent);
      if (authCheck.hasBarrier) {
        console.log(`🚫 Authentication barrier detected: ${authCheck.reason}`);
        if (attempt < maxRetries) {
          continue; // Retry with different user agent
        }
        return {
          status: 'error',
          url,
          error: `Access restricted: ${authCheck.reason}. Content preview: "${textContent.substring(0, 150)}..."`
        };
      }
      
      // Extract structured content
      const headings = extractHeadings(html);
      const paragraphs = extractParagraphs(html);
      const lists = extractLists(html);
      const links = extractLinks(html, final_url);
      const images = extractImages(html, final_url);
      const forms = extractForms(html, final_url);
      const tables = extractTables(html);
      
      // Quality check
      if (textContent.length < 100) {
        if (attempt < maxRetries) {
          console.log(`⚠️ Low content quality (${textContent.length} chars), retrying...`);
          continue;
        }
      }

      const result: ScrapeResult = {
        status: 'success',
        url,
        final_url,
        title,
        content: {
          text: {
            full_text: textContent,
            headings,
            paragraphs,
            lists
          },
          links,
          forms,
          images,
          tables,
          navigation: [] // Could be enhanced with nav extraction
        },
        meta: {
          'user-agent': userAgent,
          'scraped_at': new Date().toISOString(),
          'attempts': attempt.toString()
        },
        statistics: {
          total_links: links.length,
          total_forms: forms.length,
          total_images: images.length,
          total_tables: tables.length,
          text_length: textContent.length
        }
      };

      console.log('✅ Enhanced scraping successful:', {
        title: title.substring(0, 50),
        textLength: textContent.length,
        linksCount: links.length,
        formsCount: forms.length,
        tablesCount: tables.length,
        attempt
      });

      return result;

    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        return {
          status: 'error',
          url,
          error: `Enhanced scraping failed after ${maxRetries} attempts: ${error.message}`
        };
      }
    }
  }

  return {
    status: 'error',
    url,
    error: 'All retry attempts failed'
  };
}

async function basicScrape(url: string): Promise<ScrapeResult> {
  console.log('🔄 Attempting basic scraping fallback for:', url);
  
  try {
    const response = await fetch(`https://dywlonihwrnutwvzqivo.functions.supabase.co/web-scraper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Basic scraper failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Basic scraping fallback completed');
    return result;
    
  } catch (error) {
    console.error('❌ Basic scraping fallback failed:', error);
    return {
      status: 'error',
      url,
      error: `Both enhanced and basic scraping failed: ${error.message}`
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
        JSON.stringify({ status: 'error', error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 Enhanced hybrid scraping strategy initiated for:', url);

    // Primary: Enhanced scraping with retry logic
    let result = await enhancedScrapeWithRetry(url, 3);
    
    // Fallback: Basic scraper if enhanced scraping failed or got minimal content
    if (result.status === 'error' || (result.content?.text?.full_text?.length || 0) < 200) {
      console.log('⚠️ Enhanced scraping insufficient, trying basic scraper fallback...');
      const fallbackResult = await basicScrape(url);
      
      // Use fallback if it's better
      if (fallbackResult.status === 'success' && 
          (fallbackResult.content?.text?.full_text?.length || 0) > (result.content?.text?.full_text?.length || 0)) {
        console.log('✅ Basic scraper provided better results, using fallback');
        result = fallbackResult;
      }
    }

    // Final validation
    if (result.status === 'success') {
      const contentLength = result.content?.text?.full_text?.length || 0;
      if (contentLength < 50) {
        result = {
          status: 'error',
          url,
          error: `Insufficient content extracted (${contentLength} characters). The page may require authentication, have access restrictions, or use heavy JavaScript rendering.`
        };
      }
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('💥 Enhanced scraping system error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        error: `Scraping system error: ${error.message}`
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
