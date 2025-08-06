
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
  console.log('🚀 Starting modern BrowserQL scraping for:', url);
  
  try {
    // Use the modern BrowserQL endpoint
    const browserlessUrl = `https://production-sfo.browserless.io/function`;
    
    // Modern BrowserQL query for content extraction
    const browserqlQuery = `
      export default async ({ page, context }) => {
        console.log('🌐 Navigating to:', "${url}");
        
        // Navigate with enhanced options
        await page.goto("${url}", { 
          waitUntil: 'networkidle0',
          timeout: 60000 
        });
        
        // Wait for dynamic content to load
        await page.waitForTimeout(3000);
        
        // Try to handle common authentication prompts
        try {
          await page.evaluate(() => {
            // Look for common "Continue as Guest" or "Skip Login" buttons
            const guestButtons = document.querySelectorAll([
              'button:contains("guest")',
              'button:contains("skip")',
              'button:contains("continue")',
              'a:contains("guest")',
              'a:contains("continue")',
              '.guest-access',
              '.skip-login',
              '[data-testid*="guest"]',
              '[data-testid*="skip"]'
            ].join(','));
            
            if (guestButtons.length > 0) {
              guestButtons[0].click();
              console.log('🔓 Clicked guest access button');
            }
          });
          
          // Wait after clicking
          await page.waitForTimeout(2000);
        } catch (e) {
          console.log('ℹ️ No guest access buttons found or clickable');
        }
        
        // Extract comprehensive content
        const result = await page.evaluate(() => {
          const title = document.title || 'Untitled';
          
          // Extract headings
          const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          const headings = Array.from(headingElements).map(el => ({
            level: parseInt(el.tagName.charAt(1)),
            text: el.textContent?.trim() || ''
          }));
          
          // Extract paragraphs
          const paragraphElements = document.querySelectorAll('p');
          const paragraphs = Array.from(paragraphElements)
            .map(el => el.textContent?.trim() || '')
            .filter(text => text.length > 20);
          
          // Extract links
          const linkElements = document.querySelectorAll('a[href]');
          const links = Array.from(linkElements).map(el => {
            const href = el.getAttribute('href') || '';
            const text = el.textContent?.trim() || '';
            let absolute_url = href;
            
            try {
              if (!href.startsWith('http')) {
                absolute_url = href.startsWith('/') 
                  ? \`\${window.location.origin}\${href}\`
                  : new URL(href, window.location.href).href;
              }
            } catch {
              absolute_url = href;
            }
            
            return {
              text: text || href,
              href,
              absolute_url,
              is_external: !absolute_url.includes(window.location.hostname)
            };
          }).filter(link => link.href && !link.href.startsWith('#'));
          
          // Extract forms
          const formElements = document.querySelectorAll('form');
          const forms = Array.from(formElements).map(form => {
            const action = form.getAttribute('action') || window.location.href;
            const method = form.getAttribute('method') || 'GET';
            
            const inputElements = form.querySelectorAll('input, textarea, select');
            const inputs = Array.from(inputElements).map(input => ({
              type: input.getAttribute('type') || 'text',
              name: input.getAttribute('name') || '',
              placeholder: input.getAttribute('placeholder') || '',
              required: input.hasAttribute('required')
            }));
            
            return { action, method: method.toUpperCase(), inputs };
          });
          
          // Extract images
          const imageElements = document.querySelectorAll('img[src]');
          const images = Array.from(imageElements).map(img => {
            const src = img.getAttribute('src') || '';
            const alt = img.getAttribute('alt') || '';
            let absolute_url = src;
            
            try {
              if (!src.startsWith('http')) {
                absolute_url = src.startsWith('/') 
                  ? \`\${window.location.origin}\${src}\`
                  : new URL(src, window.location.href).href;
              }
            } catch {
              absolute_url = src;
            }
            
            return { src, absolute_url, alt };
          });
          
          // Extract tables
          const tableElements = document.querySelectorAll('table');
          const tables = Array.from(tableElements).map(table => {
            const headerElements = table.querySelectorAll('th');
            const headers = Array.from(headerElements).map(th => th.textContent?.trim() || '');
            
            const rowElements = table.querySelectorAll('tbody tr, tr');
            const rows = Array.from(rowElements).map(tr => {
              const cellElements = tr.querySelectorAll('td');
              return Array.from(cellElements).map(td => td.textContent?.trim() || '');
            }).filter(row => row.length > 0);
            
            return {
              headers,
              rows,
              total_rows: rows.length
            };
          });
          
          // Extract lists
          const listElements = document.querySelectorAll('ul, ol');
          const lists = Array.from(listElements).map(list => {
            const type = list.tagName.toLowerCase();
            const itemElements = list.querySelectorAll('li');
            const items = Array.from(itemElements).map(li => li.textContent?.trim() || '');
            return { type, items: items.filter(item => item.length > 0) };
          });
          
          // Get full text content
          const scripts = document.querySelectorAll('script, style, noscript');
          scripts.forEach(el => el.remove());
          const fullText = document.body?.textContent?.replace(/\\s+/g, ' ').trim() || '';
          
          return {
            title,
            fullText,
            headings,
            paragraphs,
            links,
            forms,
            images,
            tables,
            lists,
            finalUrl: window.location.href
          };
        });
        
        return result;
      };
    `;

    console.log('📡 Making request to modern BrowserQL endpoint...');
    console.log('🔗 Endpoint URL:', browserlessUrl);
    
    const response = await fetch(browserlessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/javascript',
        'Authorization': `Bearer ${apiKey}`,
        'Cache-Control': 'no-cache'
      },
      body: browserqlQuery
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ BrowserQL API error response:', errorText);
      
      // Enhanced error handling with specific messages
      if (response.status === 401) {
        throw new Error('BrowserQL API key is invalid or expired');
      } else if (response.status === 402) {
        throw new Error('BrowserQL account has exceeded usage limits');
      } else if (response.status === 403) {
        throw new Error('Access forbidden. Check API key permissions');
      } else if (response.status === 404) {
        throw new Error('BrowserQL endpoint not found. API may have changed');
      } else if (response.status === 429) {
        throw new Error('BrowserQL rate limit exceeded. Please try again later');
      } else if (response.status === 500) {
        throw new Error('BrowserQL service is temporarily unavailable');
      } else {
        throw new Error(`BrowserQL API error: ${response.status} - ${errorText}`);
      }
    }

    const extractedData = await response.json();
    console.log('✅ BrowserQL extraction successful:', {
      title: extractedData.title?.substring(0, 50),
      textLength: extractedData.fullText?.length || 0,
      linksCount: extractedData.links?.length || 0,
      formsCount: extractedData.forms?.length || 0
    });

    // Transform to our standard format
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

    // Validate content quality
    if (!result.content?.text?.full_text || result.content.text.full_text.length < 100) {
      console.log('⚠️ Low content warning:', result.content?.text?.full_text?.length || 0, 'characters');
      result.meta = { 
        ...result.meta, 
        'warning': 'Low content extracted - site may require authentication or have access restrictions' 
      };
    }

    return result;

  } catch (error) {
    console.error('❌ BrowserQL scraping failed:', error);
    return {
      status: 'error',
      url,
      error: `BrowserQL scraping failed: ${error.message}`
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
          error: 'BrowserQL API key not configured' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 BrowserQL scraping initiated for:', url);
    console.log('🔑 API key configured:', apiKey ? 'Yes' : 'No');
    
    const result = await scrapeWithBrowserless(url, apiKey);

    // Enhanced result validation and logging
    if (result.status === 'success') {
      const contentLength = result.content?.text?.full_text?.length || 0;
      console.log('📊 Content analysis:', {
        contentLength,
        hasTitle: !!result.title,
        linksFound: result.content?.links?.length || 0,
        formsFound: result.content?.forms?.length || 0,
        headingsFound: result.content?.text?.headings?.length || 0,
        quality: contentLength > 1000 ? 'HIGH' : contentLength > 200 ? 'MEDIUM' : 'LOW'
      });
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
        error: `BrowserQL scraping system error: ${error.message}`
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
