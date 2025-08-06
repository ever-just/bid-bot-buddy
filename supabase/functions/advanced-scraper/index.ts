
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

async function advancedScrapeWithPlaywright(url: string): Promise<ScrapeResult> {
  console.log('🚀 Advanced scraping with Playwright simulation for:', url);
  
  try {
    // This simulates a more advanced scraping approach
    // In a real implementation, we'd use Playwright or similar browser automation
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Enhanced content extraction
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
    
    // Extract text content more intelligently
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract headings
    const headingMatches = Array.from(html.matchAll(/<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi));
    const headings = headingMatches.map(match => ({
      level: parseInt(match[1]),
      text: match[2].trim()
    }));

    // Extract paragraphs
    const paragraphMatches = Array.from(html.matchAll(/<p[^>]*>([^<]+)<\/p>/gi));
    const paragraphs = paragraphMatches.map(match => match[1].trim());

    // Extract links
    const linkMatches = Array.from(html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi));
    const links = linkMatches.map(match => {
      const href = match[1];
      const text = match[2].trim();
      const absolute_url = href.startsWith('http') ? href : new URL(href, url).href;
      return {
        text,
        href,
        absolute_url,
        is_external: !absolute_url.includes(new URL(url).hostname)
      };
    });

    // Extract tables
    const tableMatches = Array.from(html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi));
    const tables = tableMatches.map(match => {
      const tableHtml = match[1];
      const headerMatches = Array.from(tableHtml.matchAll(/<th[^>]*>([^<]*)<\/th>/gi));
      const headers = headerMatches.map(h => h[1].trim());
      
      const rowMatches = Array.from(tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));
      const rows = rowMatches.map(row => {
        const cellMatches = Array.from(row[1].matchAll(/<td[^>]*>([^<]*)<\/td>/gi));
        return cellMatches.map(cell => cell[1].trim());
      });

      return {
        headers,
        rows,
        total_rows: rows.length
      };
    });

    // Check for common authentication/access barriers
    const authIndicators = [
      'sign in', 'log in', 'login', 'authentication required',
      'access denied', 'unauthorized', 'cookies enabled',
      'javascript required', 'please enable'
    ];
    
    const hasAuthBarrier = authIndicators.some(indicator => 
      textContent.toLowerCase().includes(indicator)
    );

    if (hasAuthBarrier && textContent.length < 500) {
      console.log('⚠️ Detected authentication barrier:', textContent.substring(0, 200));
      return {
        status: 'error',
        url,
        error: `Authentication barrier detected. The page requires login or has access restrictions. Content preview: "${textContent.substring(0, 200)}..."`
      };
    }

    const result: ScrapeResult = {
      status: 'success',
      url,
      final_url: response.url,
      title,
      content: {
        text: {
          full_text: textContent,
          headings,
          paragraphs,
          lists: []
        },
        links,
        forms: [],
        images: [],
        tables,
        navigation: []
      },
      statistics: {
        total_links: links.length,
        total_forms: 0,
        total_images: 0,
        total_tables: tables.length,
        text_length: textContent.length
      }
    };

    console.log('✅ Advanced scraping completed:', {
      title,
      textLength: textContent.length,
      linksCount: links.length,
      tablesCount: tables.length
    });

    return result;

  } catch (error) {
    console.error('❌ Advanced scraping failed:', error);
    return {
      status: 'error',
      url,
      error: error.message || 'Advanced scraping failed'
    };
  }
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
    console.log('✅ Basic scraping completed as fallback');
    return result;
    
  } catch (error) {
    console.error('❌ Basic scraping fallback also failed:', error);
    return {
      status: 'error',
      url,
      error: `Both advanced and basic scraping failed: ${error.message}`
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

    console.log('🎯 Hybrid scraping strategy initiated for:', url);

    // First attempt: Advanced scraping with better headers and logic
    let result = await advancedScrapeWithPlaywright(url);
    
    // If advanced scraping failed or got minimal content, try basic scraper as fallback
    if (result.status === 'error' || (result.content?.text?.full_text?.length || 0) < 200) {
      console.log('⚠️ Advanced scraping insufficient, trying basic scraper fallback...');
      const fallbackResult = await basicScrape(url);
      
      // Use fallback result if it's better
      if (fallbackResult.status === 'success' && 
          (fallbackResult.content?.text?.full_text?.length || 0) > (result.content?.text?.full_text?.length || 0)) {
        console.log('✅ Basic scraper provided better results, using fallback');
        result = fallbackResult;
      }
    }

    // Final validation
    if (result.status === 'success') {
      const contentLength = result.content?.text?.full_text?.length || 0;
      if (contentLength < 100) {
        result = {
          status: 'error',
          url,
          error: `Insufficient content extracted (${contentLength} characters). The page may require authentication or have access restrictions.`
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
    console.error('💥 Hybrid scraping system error:', error);
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
