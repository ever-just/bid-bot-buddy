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

interface ScrapingAttempt {
  timestamp: string;
  url: string;
  scraper_type: 'browserql' | 'enhanced' | 'basic';
  success: boolean;
  content_length: number;
  error?: string;
  duration_ms: number;
}

class ApiService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-python-backend.herokuapp.com'
    : 'http://localhost:8080';

  private scrapingAttempts: ScrapingAttempt[] = [];

  async scrapeRFP(url: string): Promise<ScrapeResult> {
    console.log('🕷️ Starting intelligent scraping system for:', url);
    
    try {
      // Tier 1: Modern BrowserQL scraper (primary)
      console.log('🚀 Attempting BrowserQL scraping (Tier 1)...');
      const startTime = Date.now();
      const browserqlResult = await this.scrapeWithBrowserQL(url);
      
      this.logScrapingAttempt({
        timestamp: new Date().toISOString(),
        url,
        scraper_type: 'browserql',
        success: browserqlResult.status === 'success',
        content_length: browserqlResult.content?.text?.full_text?.length || 0,
        error: browserqlResult.error,
        duration_ms: Date.now() - startTime
      });
      
      if (browserqlResult.status === 'success' && this.isQualityContent(browserqlResult)) {
        console.log('✅ BrowserQL scraping successful with quality content!');
        return browserqlResult;
      }

      console.log('⚠️ BrowserQL insufficient quality, trying enhanced scraper (Tier 2)...');
      
      // Tier 2: Enhanced scraper fallback
      const enhancedStartTime = Date.now();
      const enhancedResult = await this.scrapeWithEnhanced(url);
      
      this.logScrapingAttempt({
        timestamp: new Date().toISOString(),
        url,
        scraper_type: 'enhanced',
        success: enhancedResult.status === 'success',
        content_length: enhancedResult.content?.text?.full_text?.length || 0,
        error: enhancedResult.error,
        duration_ms: Date.now() - enhancedStartTime
      });
      
      if (enhancedResult.status === 'success' && this.isQualityContent(enhancedResult)) {
        console.log('✅ Enhanced scraper successful with quality content!');
        return enhancedResult;
      }

      console.log('⚠️ Enhanced scraper insufficient, trying basic scraper (Tier 3)...');
      
      // Tier 3: Basic scraper last resort
      const basicStartTime = Date.now();
      const basicResult = await this.scrapeWithBasic(url);
      
      this.logScrapingAttempt({
        timestamp: new Date().toISOString(),
        url,
        scraper_type: 'basic',
        success: basicResult.status === 'success',
        content_length: basicResult.content?.text?.full_text?.length || 0,
        error: basicResult.error,
        duration_ms: Date.now() - basicStartTime
      });
      
      if (basicResult.status === 'success') {
        console.log('✅ Basic scraper completed (minimal content)');
        return basicResult;
      }

      // All tiers failed
      console.log('❌ All scraping tiers failed');
      return {
        status: 'error',
        url: url,
        error: 'All scraping methods failed. The page may have severe access restrictions or require manual authentication.',
        meta: {
          'attempts': '3',
          'scrapers_tried': 'browserql,enhanced,basic',
          'failure_reason': 'complete_failure'
        }
      };
      
    } catch (error) {
      console.error('❌ Error in intelligent scraping system:', error);
      
      return {
        status: 'error',
        url: url,
        error: error instanceof Error ? error.message : 'Intelligent scraping system failed'
      };
    }
  }

  private isQualityContent(result: ScrapeResult): boolean {
    const contentLength = result.content?.text?.full_text?.length || 0;
    const hasHeadings = (result.content?.text?.headings?.length || 0) > 0;
    const hasLinks = (result.content?.links?.length || 0) > 0;
    
    // Quality thresholds
    const isHighQuality = contentLength > 1000 && hasHeadings;
    const isMediumQuality = contentLength > 200 && (hasHeadings || hasLinks);
    
    console.log('📊 Content quality assessment:', {
      contentLength,
      hasHeadings,
      hasLinks,
      quality: isHighQuality ? 'HIGH' : isMediumQuality ? 'MEDIUM' : 'LOW'
    });
    
    return isHighQuality || isMediumQuality;
  }

  private logScrapingAttempt(attempt: ScrapingAttempt): void {
    this.scrapingAttempts.push(attempt);
    console.log('📝 Scraping attempt logged:', {
      scraper: attempt.scraper_type,
      success: attempt.success,
      contentLength: attempt.content_length,
      duration: `${attempt.duration_ms}ms`
    });
    
    // Keep only last 10 attempts in memory
    if (this.scrapingAttempts.length > 10) {
      this.scrapingAttempts = this.scrapingAttempts.slice(-10);
    }
  }

  private async scrapeWithBrowserQL(url: string): Promise<ScrapeResult> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      console.log('🔧 Invoking BrowserQL scraper...');
      const { data, error } = await supabase.functions.invoke('browserless-scraper', {
        body: { url }
      });

      if (error) {
        throw new Error(error.message || 'BrowserQL scraper failed');
      }

      console.log('✅ BrowserQL scraper response received');
      return data;
    } catch (error) {
      console.error('❌ BrowserQL scraper error:', error);
      return {
        status: 'error',
        url: url,
        error: error instanceof Error ? error.message : 'BrowserQL scraper failed'
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

  // Get scraping performance metrics
  getScrapingMetrics(): {
    totalAttempts: number;
    successRate: number;
    averageDuration: number;
    scraperPerformance: Record<string, { attempts: number; successRate: number }>;
  } {
    const totalAttempts = this.scrapingAttempts.length;
    const successfulAttempts = this.scrapingAttempts.filter(a => a.success).length;
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;
    const averageDuration = totalAttempts > 0 
      ? this.scrapingAttempts.reduce((sum, a) => sum + a.duration_ms, 0) / totalAttempts 
      : 0;

    const scraperPerformance: Record<string, { attempts: number; successRate: number }> = {};
    ['browserql', 'enhanced', 'basic'].forEach(scraper => {
      const attempts = this.scrapingAttempts.filter(a => a.scraper_type === scraper);
      const successful = attempts.filter(a => a.success);
      scraperPerformance[scraper] = {
        attempts: attempts.length,
        successRate: attempts.length > 0 ? (successful.length / attempts.length) * 100 : 0
      };
    });

    return {
      totalAttempts,
      successRate,
      averageDuration,
      scraperPerformance
    };
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
    
    const requirements = this.extractRequirements(text, headings);
    const deadlines = this.extractDeadlines(text);
    const budget = this.extractBudget(text);
    const scope = this.extractScope(text, headings);
    const contact_info = this.extractContactInfo(text);
    const submission_details = this.extractSubmissionDetails(text);
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
    
    const requirementKeywords = ['requirement', 'specification', 'scope', 'deliverable', 'objective'];
    headings.forEach(heading => {
      if (requirementKeywords.some(keyword => heading.text.toLowerCase().includes(keyword))) {
        requirements.push(heading.text);
      }
    });
    
    const bulletRegex = /(?:^|\n)(?:\d+\.|\*|\-|\•)\s*([^\n]+)/gi;
    let match;
    while ((match = bulletRegex.exec(text)) !== null) {
      const item = match[1].trim();
      if (item.length > 10 && item.length < 200) {
        requirements.push(item);
      }
    }
    
    return requirements.slice(0, 20);
  }

  private extractDeadlines(text: string): Array<{ date: string; description: string }> {
    const deadlines: Array<{ date: string; description: string }> = [];
    
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
    
    return deadlines.slice(0, 5);
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
    
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) contact.email = emailMatch[0];
    
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
