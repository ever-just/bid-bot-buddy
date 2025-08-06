import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    console.log('🔍 Advanced scraper starting for:', url);

    // Check if this is a SAM.gov URL and apply special handling
    const isSAMGov = url.toLowerCase().includes('sam.gov');
    
    // Enhanced headers for better compatibility
    const headers = {
      'User-Agent': isSAMGov 
        ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        : 'Mozilla/5.0 (compatible; RFPAnalyzer/1.0)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    };

    // Add SAM.gov specific headers if needed
    if (isSAMGov) {
      headers['Referer'] = 'https://sam.gov/';
      headers['Origin'] = 'https://sam.gov';
    }

    console.log('📡 Fetching with enhanced headers...', isSAMGov ? '(SAM.gov optimized)' : '');
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const contentLength = html.length;
    
    console.log('✅ Content fetched successfully:', contentLength, 'characters');

    // Enhanced content parsing for SAM.gov and general sites
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Document';

    // Extract meta description
    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1] : '';

    // Remove script and style tags
    let cleanedHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanedHtml = cleanedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleanedHtml = cleanedHtml.replace(/<!--[\s\S]*?-->/g, '');

    // Extract text content
    const textContent = cleanedHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract headings with enhanced SAM.gov support
    const headings = [];
    const headingRegex = /<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi;
    let headingMatch;
    while ((headingMatch = headingRegex.exec(html)) !== null) {
      headings.push({
        level: parseInt(headingMatch[1]),
        text: headingMatch[2].replace(/\s+/g, ' ').trim()
      });
    }

    // Extract links with better filtering
    const links = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const href = linkMatch[1];
      const text = linkMatch[2].replace(/\s+/g, ' ').trim();
      
      // Skip empty links, javascript, and internal navigation
      if (text && href && !href.startsWith('#') && !href.startsWith('javascript:') && text.length > 2) {
        const absoluteUrl = href.startsWith('http') ? href : new URL(href, url).href;
        links.push({
          text,
          href,
          absolute_url: absoluteUrl,
          is_external: !absoluteUrl.includes(new URL(url).hostname)
        });
      }
    }

    // Extract paragraphs with better content detection
    const paragraphs = [];
    const paragraphRegex = /<p[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/p>/gi;
    let paragraphMatch;
    while ((paragraphMatch = paragraphRegex.exec(html)) !== null) {
      const text = paragraphMatch[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (text.length > 20) { // Only include substantial paragraphs
        paragraphs.push(text);
      }
    }

    // Extract forms (important for government sites)
    const forms = [];
    const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;
    let formMatch;
    while ((formMatch = formRegex.exec(html)) !== null) {
      const formHtml = formMatch[1];
      const actionMatch = formMatch[0].match(/action=["']([^"']+)["']/i);
      const methodMatch = formMatch[0].match(/method=["']([^"']+)["']/i);
      
      const inputs = [];
      const inputRegex = /<input[^>]*>/gi;
      let inputMatch;
      while ((inputMatch = inputRegex.exec(formHtml)) !== null) {
        const inputHtml = inputMatch[0];
        const typeMatch = inputHtml.match(/type=["']([^"']+)["']/i);
        const nameMatch = inputHtml.match(/name=["']([^"']+)["']/i);
        const placeholderMatch = inputHtml.match(/placeholder=["']([^"']+)["']/i);
        const requiredMatch = inputHtml.match(/required/i);
        
        inputs.push({
          type: typeMatch ? typeMatch[1] : 'text',
          name: nameMatch ? nameMatch[1] : '',
          placeholder: placeholderMatch ? placeholderMatch[1] : '',
          required: !!requiredMatch
        });
      }
      
      forms.push({
        action: actionMatch ? actionMatch[1] : '',
        method: methodMatch ? methodMatch[1] : 'get',
        inputs
      });
    }

    // Build result with enhanced structure
    const result = {
      status: 'success',
      url,
      final_url: response.url,
      title,
      content: {
        text: {
          full_text: textContent,
          headings,
          paragraphs,
          lists: [] // Could be enhanced to extract lists
        },
        links: links.slice(0, 50), // Limit to prevent oversized responses
        forms,
        images: [], // Could be enhanced to extract images
        tables: [], // Could be enhanced to extract tables
        navigation: []
      },
      meta: {
        'scraper': 'advanced-scraper',
        'content_type': response.headers.get('content-type') || 'text/html',
        'status_code': response.status.toString(),
        'final_url': response.url,
        'is_sam_gov': isSAMGov ? 'true' : 'false',
        'meta_description': metaDescription
      },
      statistics: {
        total_links: links.length,
        total_forms: forms.length,
        total_images: 0,
        total_tables: 0,
        text_length: textContent.length
      }
    };

    console.log('✅ Advanced scraper completed successfully:', {
      title: result.title,
      textLength: result.statistics.text_length,
      linksFound: result.statistics.total_links,
      formsFound: result.statistics.total_forms,
      isSAMGov
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Advanced scraper error:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      error: error instanceof Error ? error.message : 'Advanced scraper failed',
      url: req.url
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
