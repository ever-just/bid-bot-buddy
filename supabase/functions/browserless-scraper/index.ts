
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
    const browserlessUrl = 'https://chrome.browserless.io/scrape';
    
    const scrapeConfig = {
      url: url,
      elements: [
        {
          selector: 'title',
          attribute: 'text'
        },
        {
          selector: 'h1, h2, h3, h4, h5, h6',
          attribute: 'text'
        },
        {
          selector: 'p',
          attribute: 'text'
        },
        {
          selector: 'a',
          attribute: 'href'
        },
        {
          selector: 'a',
          attribute: 'text'
        },
        {
          selector: 'img',
          attribute: 'src'
        },
        {
          selector: 'img',
          attribute: 'alt'
        },
        {
          selector: 'form',
          attribute: 'action'
        },
        {
          selector: 'input',
          attribute: 'type'
        },
        {
          selector: 'input',
          attribute: 'name'
        },
        {
          selector: 'input',
          attribute: 'placeholder'
        },
        {
          selector: 'table',
          attribute: 'outerHTML'
        },
        {
          selector: 'ul, ol',
          attribute: 'outerHTML'
        }
      ],
      wait: 3000, // Wait 3 seconds for dynamic content
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const response = await fetch(browserlessUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scrapeConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Browserless API error: ${response.status} - ${errorText}`);
    }

    const browserlessData = await response.json();
    console.log('✅ Browserless.io response received');

    // Transform Browserless data to our standard format
    const result = await transformBrowserlessData(browserlessData, url);
    
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

async function transformBrowserlessData(data: any, originalUrl: string): Promise<ScrapeResult> {
  const elements = data.data || [];
  
  // Extract title
  const titleElements = elements.filter((el: any) => el.selector === 'title');
  const title = titleElements.length > 0 ? titleElements[0].text : 'Untitled';

  // Extract headings
  const headingElements = elements.filter((el: any) => 
    el.selector.match(/^h[1-6]$/i) && el.text
  );
  const headings = headingElements.map((el: any) => ({
    level: parseInt(el.selector.substring(1)),
    text: el.text.trim()
  }));

  // Extract paragraphs
  const paragraphElements = elements.filter((el: any) => 
    el.selector === 'p' && el.text && el.text.trim().length > 20
  );
  const paragraphs = paragraphElements.map((el: any) => el.text.trim());

  // Extract links
  const linkHrefs = elements.filter((el: any) => el.selector === 'a' && el.href);
  const linkTexts = elements.filter((el: any) => el.selector === 'a' && el.text);
  
  const links = linkHrefs.map((hrefEl: any, index: number) => {
    const textEl = linkTexts[index];
    const href = hrefEl.href;
    const text = textEl?.text || href;
    
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
    
    return {
      text,
      href,
      absolute_url,
      is_external: !absolute_url.includes(new URL(originalUrl).hostname)
    };
  }).filter(link => link.href && !link.href.startsWith('#') && !link.href.startsWith('javascript:'));

  // Extract images
  const imageSrcs = elements.filter((el: any) => el.selector === 'img' && el.src);
  const imageAlts = elements.filter((el: any) => el.selector === 'img' && el.alt);
  
  const images = imageSrcs.map((srcEl: any, index: number) => {
    const altEl = imageAlts[index];
    const src = srcEl.src;
    const alt = altEl?.alt || '';
    
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
    
    return { src, absolute_url, alt };
  });

  // Extract forms (simplified)
  const formElements = elements.filter((el: any) => el.selector === 'form' && el.action);
  const inputTypes = elements.filter((el: any) => el.selector === 'input' && el.type);
  const inputNames = elements.filter((el: any) => el.selector === 'input' && el.name);
  const inputPlaceholders = elements.filter((el: any) => el.selector === 'input' && el.placeholder);
  
  const forms = formElements.map((formEl: any, formIndex: number) => {
    const inputs = inputTypes.slice(formIndex * 5, (formIndex + 1) * 5).map((typeEl: any, inputIndex: number) => {
      const nameEl = inputNames[formIndex * 5 + inputIndex];
      const placeholderEl = inputPlaceholders[formIndex * 5 + inputIndex];
      
      return {
        type: typeEl.type || 'text',
        name: nameEl?.name || '',
        placeholder: placeholderEl?.placeholder || '',
        required: false
      };
    });
    
    return {
      action: formEl.action || originalUrl,
      method: 'GET',
      inputs
    };
  });

  // Extract lists
  const listElements = elements.filter((el: any) => 
    el.selector.match(/^[uo]l$/i) && el.outerHTML
  );
  const lists = listElements.map((el: any) => {
    const type = el.selector.toLowerCase();
    const html = el.outerHTML;
    const itemMatches = html.match(/<li[^>]*>([^<]+)<\/li>/gi) || [];
    const items = itemMatches.map((item: string) => {
      const textMatch = item.match(/>([^<]+)</);
      return textMatch ? textMatch[1].trim() : '';
    }).filter((item: string) => item.length > 0);
    
    return { type, items };
  });

  // Extract tables (simplified)
  const tableElements = elements.filter((el: any) => 
    el.selector === 'table' && el.outerHTML
  );
  const tables = tableElements.map((el: any) => {
    const html = el.outerHTML;
    const headerMatches = html.match(/<th[^>]*>([^<]+)<\/th>/gi) || [];
    const headers = headerMatches.map((header: string) => {
      const textMatch = header.match(/>([^<]+)</);
      return textMatch ? textMatch[1].trim() : '';
    });
    
    const rowMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    const rows = rowMatches.slice(1).map((row: string) => {
      const cellMatches = row.match(/<td[^>]*>([^<]+)<\/td>/gi) || [];
      return cellMatches.map((cell: string) => {
        const textMatch = cell.match(/>([^<]+)</);
        return textMatch ? textMatch[1].trim() : '';
      });
    });
    
    return {
      headers,
      rows,
      total_rows: rows.length
    };
  });

  // Create full text
  const fullText = [
    title,
    ...headings.map(h => h.text),
    ...paragraphs,
    ...lists.flatMap(l => l.items)
  ].join(' ');

  return {
    status: 'success',
    url: originalUrl,
    final_url: data.url || originalUrl,
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
      'user_agent': 'Browserless Chrome'
    },
    statistics: {
      total_links: links.length,
      total_forms: forms.length,
      total_images: images.length,
      total_tables: tables.length,
      text_length: fullText.length
    }
  };
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
    
    const result = await scrapeWithBrowserless(url, apiKey);

    // Final validation
    if (result.status === 'success') {
      const contentLength = result.content?.text?.full_text?.length || 0;
      if (contentLength < 50) {
        result.status = 'error';
        result.error = `Insufficient content extracted (${contentLength} characters). The page may have complex authentication or dynamic loading.`;
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
