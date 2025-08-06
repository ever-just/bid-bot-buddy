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

async function scrapeWithBrowserless(url: string, apiKey: string): Promise<ScrapeResult> {
  console.log('🚀 Starting Browserless.io scraping for:', url);
  
  try {
    // Use the correct production endpoint
    const browserlessUrl = `https://production-sfo.browserless.io/content?token=${apiKey}`;
    
    const requestBody = {
      url: url,
      gotoOptions: {
        waitUntil: 'networkidle2',
        timeout: 60000 // Increased timeout for complex sites
      },
      addScriptTag: [{
        content: `
          // Wait for dynamic content and forms to load
          setTimeout(() => {
            // Try to interact with any login prompts or continue buttons
            const continueBtn = document.querySelector('input[type="submit"], button[type="submit"], .btn-primary, [onclick*="continue"]');
            if (continueBtn && continueBtn.offsetParent !== null) {
              continueBtn.click();
            }
            window.browserlessReady = true;
          }, 5000);
        `
      }],
      waitForFunction: {
        fn: '() => window.browserlessReady === true',
        timeout: 10000
      },
      setUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      setCookie: [
        {
          name: 'session_id',
          value: 'guest_session_' + Date.now(),
          domain: new URL(url).hostname
        }
      ],
      viewport: {
        width: 1920,
        height: 1080
      },
      // Add authentication and session handling options
      rejectRequestPattern: [],
      requestInterceptors: [{
        pattern: '**',
        response: {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive'
          }
        }
      }]
    };

    console.log('📡 Making request to production Browserless.io endpoint...');
    console.log('🔗 Endpoint URL:', browserlessUrl);
    
    const response = await fetch(browserlessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Browserless API error response:', errorText);
      
      // Enhanced error handling
      if (response.status === 401) {
        throw new Error('Browserless API key is invalid or expired');
      } else if (response.status === 402) {
        throw new Error('Browserless account has exceeded usage limits');
      } else if (response.status === 403) {
        throw new Error('Access forbidden. Check API key permissions and endpoint URL');
      } else if (response.status === 404) {
        throw new Error('Browserless endpoint not found. Verify the correct API endpoint');
      } else if (response.status === 429) {
        throw new Error('Browserless rate limit exceeded. Please try again later');
      } else if (response.status === 500) {
        throw new Error('Browserless service is temporarily unavailable');
      } else {
        throw new Error(`Browserless API error: ${response.status} - ${errorText}`);
      }
    }

    const htmlContent = await response.text();
    console.log('✅ HTML content received, length:', htmlContent.length);
    console.log('📝 First 200 characters:', htmlContent.substring(0, 200));

    if (!htmlContent || htmlContent.length < 100) {
      throw new Error('Insufficient content extracted from the page. The site may require authentication or have access restrictions.');
    }

    // Transform HTML content to our standard format
    const result = await transformHtmlContent(htmlContent, url);
    
    console.log('✅ Browserless.io scraping successful:', {
      title: result.title?.substring(0, 50),
      textLength: result.content?.text?.full_text?.length || 0,
      linksCount: result.content?.links?.length || 0,
      formsCount: result.content?.forms?.length || 0
    });

    return result;

  } catch (error) {
    console.error('❌ Browserless.io scraping failed:', error);
    return {
      status: 'error',
      url,
      error: `Browserless scraping failed: ${error.message}`
    };
  }
}

async function transformHtmlContent(htmlContent: string, originalUrl: string): Promise<ScrapeResult> {
  console.log('🔄 Transforming HTML content...');
  
  try {
    // Extract title
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

    // Extract headings
    const headingRegex = /<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi;
    const headings: Array<{ level: number; text: string }> = [];
    let headingMatch;
    while ((headingMatch = headingRegex.exec(htmlContent)) !== null) {
      headings.push({
        level: parseInt(headingMatch[1]),
        text: headingMatch[2].trim()
      });
    }

    // Extract paragraphs
    const paragraphRegex = /<p[^>]*>([^<]+(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*)<\/p>/gi;
    const paragraphs: string[] = [];
    let paragraphMatch;
    while ((paragraphMatch = paragraphRegex.exec(htmlContent)) !== null) {
      const cleanText = paragraphMatch[1].replace(/<[^>]*>/g, '').trim();
      if (cleanText.length > 20) {
        paragraphs.push(cleanText);
      }
    }

    // Extract links
    const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi;
    const links: Array<{
      text: string;
      href: string;
      absolute_url: string;
      is_external: boolean;
    }> = [];
    let linkMatch;
    while ((linkMatch = linkRegex.exec(htmlContent)) !== null) {
      const href = linkMatch[1].trim();
      const text = linkMatch[2].trim();
      
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        let absolute_url = href;
        try {
          if (!href.startsWith('http')) {
            const baseUrl = new URL(originalUrl);
            if (href.startsWith('/')) {
              absolute_url = `${baseUrl.origin}${href}`;
            } else {
              absolute_url = new URL(href, originalUrl).href;
            }
          }
        } catch {
          absolute_url = href;
        }
        
        links.push({
          text: text || href,
          href,
          absolute_url,
          is_external: !absolute_url.includes(new URL(originalUrl).hostname)
        });
      }
    }

    // Extract images
    const imageRegex = /<img[^>]*src=["']([^"']*)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
    const images: Array<{
      src: string;
      absolute_url: string;
      alt: string;
    }> = [];
    let imageMatch;
    while ((imageMatch = imageRegex.exec(htmlContent)) !== null) {
      const src = imageMatch[1].trim();
      const alt = imageMatch[2] ? imageMatch[2].trim() : '';
      
      if (src) {
        let absolute_url = src;
        try {
          if (!src.startsWith('http')) {
            const baseUrl = new URL(originalUrl);
            if (src.startsWith('/')) {
              absolute_url = `${baseUrl.origin}${src}`;
            } else {
              absolute_url = new URL(src, originalUrl).href;
            }
          }
        } catch {
          absolute_url = src;
        }
        
        images.push({ src, absolute_url, alt });
      }
    }

    // Extract forms
    const formRegex = /<form[^>]*(?:action=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/form>/gi;
    const forms: Array<{
      action: string;
      method: string;
      inputs: Array<{
        type: string;
        name: string;
        placeholder: string;
        required: boolean;
      }>;
    }> = [];
    let formMatch;
    while ((formMatch = formRegex.exec(htmlContent)) !== null) {
      const action = formMatch[1] || originalUrl;
      const formContent = formMatch[2];
      
      const inputRegex = /<input[^>]*(?:type=["']([^"']*)["'])?[^>]*(?:name=["']([^"']*)["'])?[^>]*(?:placeholder=["']([^"']*)["'])?[^>]*(?:(required))?[^>]*>/gi;
      const inputs: Array<{
        type: string;
        name: string;
        placeholder: string;
        required: boolean;
      }> = [];
      let inputMatch;
      while ((inputMatch = inputRegex.exec(formContent)) !== null) {
        inputs.push({
          type: inputMatch[1] || 'text',
          name: inputMatch[2] || '',
          placeholder: inputMatch[3] || '',
          required: !!inputMatch[4]
        });
      }
      
      forms.push({
        action,
        method: 'GET',
        inputs
      });
    }

    // Extract lists
    const listRegex = /<(ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi;
    const lists: Array<{ type: string; items: string[] }> = [];
    let listMatch;
    while ((listMatch = listRegex.exec(htmlContent)) !== null) {
      const type = listMatch[1].toLowerCase();
      const listContent = listMatch[2];
      
      const itemRegex = /<li[^>]*>([^<]+(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*)<\/li>/gi;
      const items: string[] = [];
      let itemMatch;
      while ((itemMatch = itemRegex.exec(listContent)) !== null) {
        const cleanText = itemMatch[1].replace(/<[^>]*>/g, '').trim();
        if (cleanText.length > 0) {
          items.push(cleanText);
        }
      }
      
      if (items.length > 0) {
        lists.push({ type, items });
      }
    }

    // Extract tables
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables: Array<{
      headers: string[];
      rows: string[][];
      total_rows: number;
    }> = [];
    let tableMatch;
    while ((tableMatch = tableRegex.exec(htmlContent)) !== null) {
      const tableContent = tableMatch[1];
      
      const headerRegex = /<th[^>]*>([^<]+)<\/th>/gi;
      const headers: string[] = [];
      let headerMatch;
      while ((headerMatch = headerRegex.exec(tableContent)) !== null) {
        headers.push(headerMatch[1].trim());
      }
      
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const rows: string[][] = [];
      let rowMatch;
      while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
        const rowContent = rowMatch[1];
        const cellRegex = /<td[^>]*>([^<]+)<\/td>/gi;
        const cells: string[] = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
          cells.push(cellMatch[1].trim());
        }
        if (cells.length > 0) {
          rows.push(cells);
        }
      }
      
      if (headers.length > 0 || rows.length > 0) {
        tables.push({
          headers,
          rows,
          total_rows: rows.length
        });
      }
    }

    // Create full text by removing HTML tags
    const cleanText = htmlContent
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const fullText = [
      title,
      ...headings.map(h => h.text),
      cleanText
    ].join(' ');

    return {
      status: 'success',
      url: originalUrl,
      final_url: originalUrl,
      title,
      content: {
        text: {
          full_text: fullText,
          headings,
          paragraphs,
          lists
        },
        links,
        forms,
        images,
        tables,
        navigation: []
      },
      meta: {
        'scraper': 'browserless.io',
        'scraped_at': new Date().toISOString(),
        'user_agent': 'Browserless Chrome',
        'content_length': htmlContent.length.toString(),
        'endpoint': 'production-sfo'
      },
      statistics: {
        total_links: links.length,
        total_forms: forms.length,
        total_images: images.length,
        total_tables: tables.length,
        text_length: fullText.length
      }
    };

  } catch (error) {
    console.error('❌ HTML transformation error:', error);
    return {
      status: 'error',
      url: originalUrl,
      error: `Failed to transform HTML content: ${error.message}`
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

    const apiKey = Deno.env.get('BROWSERLESS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          error: 'Browserless API key not configured' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 Browserless.io scraping initiated for:', url);
    console.log('🔑 API key configured:', apiKey ? 'Yes' : 'No');
    
    const result = await scrapeWithBrowserless(url, apiKey);

    // Enhanced validation and debugging
    if (result.status === 'success') {
      const contentLength = result.content?.text?.full_text?.length || 0;
      console.log('📊 Content analysis:', {
        contentLength,
        hasTitle: !!result.title,
        linksFound: result.content?.links?.length || 0,
        formsFound: result.content?.forms?.length || 0,
        headingsFound: result.content?.text?.headings?.length || 0
      });
      
      if (contentLength < 200) {
        console.log('⚠️ Low content warning:', contentLength, 'characters');
        result.meta = { 
          ...result.meta, 
          'warning': 'Low content extracted - site may require authentication or have access restrictions' 
        };
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Browserless scraping system error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        error: `Browserless scraping system error: ${error.message}`
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
