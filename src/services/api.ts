interface ScrapeResult {
  status: string;
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

interface RFPAnalysis {
  requirements: string[];
  deadlines: Array<{ date: string; description: string }>;
  budget: string;
  scope: string;
  contact_info: Record<string, string>;
  submission_details: Record<string, string>;
  compliance_requirements: string[];
}

class ApiService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-python-backend.herokuapp.com' // Update with actual production URL
    : 'http://localhost:8080';

  async scrapeRFP(url: string): Promise<ScrapeResult> {
    try {
      console.log('🕷️ Starting advanced scraping system for:', url);
      
      // Primary: Browserless.io for complex sites and authentication barriers
      console.log('🚀 Attempting Browserless.io scraping (primary)...');
      const browserlessResult = await this.scrapeWithBrowserless(url);
      
      if (browserlessResult.status === 'success' && 
          (browserlessResult.content?.text?.full_text?.length || 0) > 200) {
        console.log('✅ Browserless.io scraping successful!');
        return browserlessResult;
      }

      console.log('⚠️ Browserless.io insufficient, trying enhanced scraper fallback...');
      
      // Fallback 1: Enhanced Supabase edge function
      const enhancedResult = await this.scrapeWithEnhanced(url);
      
      if (enhancedResult.status === 'success' && 
          (enhancedResult.content?.text?.full_text?.length || 0) > 200) {
        console.log('✅ Enhanced scraper fallback successful!');
        return enhancedResult;
      }

      console.log('⚠️ Enhanced scraper insufficient, trying basic scraper fallback...');
      
      // Fallback 2: Basic scraper
      const basicResult = await this.scrapeWithBasic(url);
      
      if (basicResult.status === 'success') {
        console.log('✅ Basic scraper fallback completed');
        return basicResult;
      }

      // All methods failed
      return {
        status: 'error',
        url: url,
        error: 'All scraping methods failed. The page may have severe access restrictions or require manual authentication.'
      };
      
    } catch (error) {
      console.error('❌ Error in advanced scraping system:', error);
      
      return {
        status: 'error',
        url: url,
        error: error instanceof Error ? error.message : 'Advanced scraping system failed'
      };
    }
  }

  private async scrapeWithBrowserless(url: string): Promise<ScrapeResult> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('browserless-scraper', {
        body: { url }
      });

      if (error) {
        throw new Error(error.message || 'Browserless scraper failed');
      }

      return data;
    } catch (error) {
      console.error('❌ Browserless scraper error:', error);
      return {
        status: 'error',
        url: url,
        error: error instanceof Error ? error.message : 'Browserless scraper failed'
      };
    }
  }

  private async scrapeWithEnhanced(url: string): Promise<ScrapeResult> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('advanced-scraper', {
        body: { url }
      });

      if (error) {
        throw new Error(error.message || 'Enhanced scraper failed');
      }

      return data;
    } catch (error) {
      console.error('❌ Enhanced scraper error:', error);
      return {
        status: 'error',
        url: url,
        error: error instanceof Error ? error.message : 'Enhanced scraper failed'
      };
    }
  }

  private async scrapeWithBasic(url: string): Promise<ScrapeResult> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('web-scraper', {
        body: { url }
      });

      if (error) {
        throw new Error(error.message || 'Basic scraper failed');
      }

      return data;
    } catch (error) {
      console.error('❌ Basic scraper error:', error);
      return {
        status: 'error',
        url: url,
        error: error instanceof Error ? error.message : 'Basic scraper failed'
      };
    }
  }

  async checkHealth(): Promise<{ status: string; timestamp: string; version: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  analyzeRFPContent(scrapedContent: ScrapeResult): RFPAnalysis {
    const text = scrapedContent.content?.text?.full_text || '';
    const headings = scrapedContent.content?.text?.headings || [];
    
    // Extract requirements from headings and text
    const requirements = this.extractRequirements(text, headings);
    
    // Extract deadlines
    const deadlines = this.extractDeadlines(text);
    
    // Extract budget information
    const budget = this.extractBudget(text);
    
    // Extract scope
    const scope = this.extractScope(text, headings);
    
    // Extract contact information
    const contact_info = this.extractContactInfo(text);
    
    // Extract submission details
    const submission_details = this.extractSubmissionDetails(text);
    
    // Extract compliance requirements
    const compliance_requirements = this.extractComplianceRequirements(text, headings);

    return {
      requirements,
      deadlines,
      budget,
      scope,
      contact_info,
      submission_details,
      compliance_requirements,
    };
  }

  private extractRequirements(text: string, headings: Array<{ level: number; text: string }>): string[] {
    const requirements: string[] = [];
    
    // Look for requirement keywords in headings
    const requirementKeywords = ['requirement', 'specification', 'scope', 'deliverable', 'objective'];
    headings.forEach(heading => {
      if (requirementKeywords.some(keyword => heading.text.toLowerCase().includes(keyword))) {
        requirements.push(heading.text);
      }
    });
    
    // Extract bullet points and numbered lists that look like requirements
    const bulletRegex = /(?:^|\n)(?:\d+\.|\*|\-|\•)\s*([^\n]+)/gi;
    let match;
    while ((match = bulletRegex.exec(text)) !== null) {
      const item = match[1].trim();
      if (item.length > 10 && item.length < 200) {
        requirements.push(item);
      }
    }
    
    return requirements.slice(0, 20); // Limit to 20 requirements
  }

  private extractDeadlines(text: string): Array<{ date: string; description: string }> {
    const deadlines: Array<{ date: string; description: string }> = [];
    
    // Look for date patterns
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})/gi;
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      const dateMatch = sentence.match(dateRegex);
      if (dateMatch) {
        deadlines.push({
          date: dateMatch[0],
          description: sentence.trim().substring(0, 100) + '...'
        });
      }
    });
    
    return deadlines.slice(0, 5); // Limit to 5 deadlines
  }

  private extractBudget(text: string): string {
    const budgetRegex = /\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*\s*(?:dollars?|USD|budget)/gi;
    const match = text.match(budgetRegex);
    return match ? match[0] : 'Budget not specified';
  }

  private extractScope(text: string, headings: Array<{ level: number; text: string }>): string {
    const scopeKeywords = ['scope', 'overview', 'description', 'project summary'];
    
    for (const heading of headings) {
      if (scopeKeywords.some(keyword => heading.text.toLowerCase().includes(keyword))) {
        // Find the text following this heading
        const headingIndex = text.indexOf(heading.text);
        if (headingIndex !== -1) {
          const followingText = text.substring(headingIndex + heading.text.length, headingIndex + 500);
          return followingText.trim().split('\n')[0] || 'Scope not clearly defined';
        }
      }
    }
    
    return text.substring(0, 300) + '...';
  }

  private extractContactInfo(text: string): Record<string, string> {
    const contact: Record<string, string> = {};
    
    // Email
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) contact.email = emailMatch[0];
    
    // Phone
    const phoneMatch = text.match(/(?:\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    if (phoneMatch) contact.phone = phoneMatch[0];
    
    return contact;
  }

  private extractSubmissionDetails(text: string): Record<string, string> {
    const details: Record<string, string> = {};
    
    if (text.toLowerCase().includes('email')) {
      details.method = 'Email submission';
    } else if (text.toLowerCase().includes('portal') || text.toLowerCase().includes('online')) {
      details.method = 'Online portal';
    } else {
      details.method = 'To be determined';
    }
    
    return details;
  }

  private extractComplianceRequirements(text: string, headings: Array<{ level: number; text: string }>): string[] {
    const compliance: string[] = [];
    const complianceKeywords = ['compliance', 'certification', 'regulation', 'standard', 'requirement'];
    
    headings.forEach(heading => {
      if (complianceKeywords.some(keyword => heading.text.toLowerCase().includes(keyword))) {
        compliance.push(heading.text);
      }
    });
    
    return compliance.slice(0, 10);
  }
}

export const apiService = new ApiService();
export type { ScrapeResult, RFPAnalysis };
