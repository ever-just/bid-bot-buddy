
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      throw new Error('URL is required')
    }

    console.log('Scraping URL:', url)

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    
    // Basic HTML parsing to extract content
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Document'

    // Extract headings
    const headingMatches = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || []
    const headings = headingMatches.map((match, index) => {
      const levelMatch = match.match(/<h([1-6])/i)
      const textMatch = match.match(/>([^<]+)</i)
      return {
        level: levelMatch ? parseInt(levelMatch[1]) : 1,
        text: textMatch ? textMatch[1].trim() : `Heading ${index + 1}`
      }
    })

    // Extract paragraphs
    const paragraphMatches = html.match(/<p[^>]*>([^<]+)<\/p>/gi) || []
    const paragraphs = paragraphMatches.map(match => {
      const textMatch = match.match(/>([^<]+)</i)
      return textMatch ? textMatch[1].trim() : ''
    }).filter(p => p.length > 0)

    // Extract lists
    const listMatches = html.match(/<[uo]l[^>]*>(.*?)<\/[uo]l>/gis) || []
    const lists = listMatches.map(listHtml => {
      const type = listHtml.startsWith('<ul') ? 'ul' : 'ol'
      const itemMatches = listHtml.match(/<li[^>]*>([^<]+)<\/li>/gi) || []
      const items = itemMatches.map(item => {
        const textMatch = item.match(/>([^<]+)</i)
        return textMatch ? textMatch[1].trim() : ''
      }).filter(item => item.length > 0)
      return { type, items }
    })

    // Extract links
    const linkMatches = html.match(/<a[^>]+href=['"']([^'"']+)['"'][^>]*>([^<]+)<\/a>/gi) || []
    const links = linkMatches.map(match => {
      const hrefMatch = match.match(/href=['"']([^'"']+)['"']/i)
      const textMatch = match.match(/>([^<]+)</i)
      const href = hrefMatch ? hrefMatch[1] : ''
      const text = textMatch ? textMatch[1].trim() : ''
      
      // Convert relative URLs to absolute
      let absoluteUrl = href
      if (href.startsWith('/')) {
        const urlObj = new URL(url)
        absoluteUrl = `${urlObj.origin}${href}`
      } else if (!href.startsWith('http')) {
        const urlObj = new URL(url)
        absoluteUrl = `${urlObj.origin}/${href}`
      }
      
      return {
        text,
        href,
        absolute_url: absoluteUrl,
        is_external: !absoluteUrl.includes(new URL(url).hostname)
      }
    })

    // Create full text by combining all text content
    const fullText = [title, ...paragraphs, ...lists.flatMap(l => l.items)].join(' ')

    // Extract tables (basic implementation)
    const tableMatches = html.match(/<table[^>]*>(.*?)<\/table>/gis) || []
    const tables = tableMatches.map(tableHtml => {
      const rowMatches = tableHtml.match(/<tr[^>]*>(.*?)<\/tr>/gis) || []
      const rows = rowMatches.map(rowHtml => {
        const cellMatches = rowHtml.match(/<t[hd][^>]*>([^<]+)<\/t[hd]>/gi) || []
        return cellMatches.map(cell => {
          const textMatch = cell.match(/>([^<]+)</i)
          return textMatch ? textMatch[1].trim() : ''
        })
      })
      
      const headers = rows.length > 0 ? rows[0] : []
      const dataRows = rows.slice(1)
      
      return {
        headers,
        rows: dataRows,
        total_rows: dataRows.length
      }
    })

    const result = {
      status: 'success',
      url: url,
      final_url: url,
      title: title,
      content: {
        text: {
          full_text: fullText,
          headings: headings,
          paragraphs: paragraphs,
          lists: lists
        },
        links: links,
        forms: [], // Could be implemented later if needed
        images: [], // Could be implemented later if needed
        tables: tables,
        navigation: []
      },
      meta: {
        'description': `Scraped content from ${url}`,
        'scraped_at': new Date().toISOString()
      },
      statistics: {
        total_links: links.length,
        total_forms: 0,
        total_images: 0,
        total_tables: tables.length,
        text_length: fullText.length
      }
    }

    console.log('Scraping completed successfully:', {
      url,
      title,
      textLength: fullText.length,
      linksCount: links.length,
      tablesCount: tables.length
    })

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Scraping error:', error)
    
    return new Response(JSON.stringify({
      status: 'error',
      error: error.message,
      url: ''
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
