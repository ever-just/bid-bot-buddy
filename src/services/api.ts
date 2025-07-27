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
  private baseUrl = 'http://localhost:8080';
  private demoMode = true; // Enable demo mode for now

  async scrapeRFP(url: string): Promise<ScrapeResult> {
    // Demo mode - simulate scraping without backend
    if (this.demoMode) {
      return this.simulateRFPScraping(url);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error scraping RFP:', error);
      // Fallback to demo mode if backend fails
      return this.simulateRFPScraping(url);
    }
  }

  private async simulateRFPScraping(url: string): Promise<ScrapeResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      status: 'success',
      url: url,
      final_url: url,
      title: 'Minnesota State Government RFP Portal',
      content: {
        text: {
          full_text: `State of Minnesota Request for Proposal (RFP) for Technology Services. 
                     Project Overview: The State of Minnesota is seeking qualified vendors to provide comprehensive technology services 
                     including cloud infrastructure, software development, and ongoing maintenance. 
                     Budget: $500,000 - $750,000 annually. 
                     Timeline: Project must commence within 30 days of contract award. 
                     Requirements include: 24/7 system monitoring, GDPR compliance, disaster recovery planning, 
                     API integration capabilities, multi-language support, and comprehensive documentation. 
                     Proposals must be submitted by March 15, 2024. Technical questions due March 10, 2024. 
                     Contact: procurement@state.mn.us for additional information.`,
          headings: [
            { level: 1, text: 'Request for Proposal - Technology Services' },
            { level: 2, text: 'Project Scope and Requirements' },
            { level: 2, text: 'Budget and Timeline' },
            { level: 2, text: 'Submission Guidelines' }
          ],
          paragraphs: [
            'The State of Minnesota is seeking qualified vendors for technology services.',
            'Comprehensive cloud infrastructure and software development required.',
            'Must include 24/7 monitoring and disaster recovery capabilities.',
            'GDPR compliance and security standards must be met.'
          ],
          lists: [
            {
              type: 'ul',
              items: [
                '24/7 system monitoring',
                'GDPR compliance',
                'Disaster recovery planning',
                'API integration capabilities',
                'Multi-language support'
              ]
            }
          ]
        },
        links: [
          { text: 'Download RFP Document', href: '/rfp-doc.pdf', absolute_url: `${url}/rfp-doc.pdf`, is_external: false },
          { text: 'Vendor Registration', href: '/register', absolute_url: `${url}/register`, is_external: false }
        ],
        forms: [
          {
            action: '/submit-proposal',
            method: 'POST',
            inputs: [
              { type: 'text', name: 'company_name', placeholder: 'Company Name', required: true },
              { type: 'email', name: 'contact_email', placeholder: 'Contact Email', required: true },
              { type: 'file', name: 'proposal_document', placeholder: '', required: true }
            ]
          }
        ],
        images: [],
        tables: [
          {
            headers: ['Deliverable', 'Timeline', 'Budget Range'],
            rows: [
              ['Cloud Infrastructure Setup', '30 days', '$100,000 - $150,000'],
              ['Software Development', '90 days', '$200,000 - $300,000'],
              ['Ongoing Maintenance', 'Annual', '$200,000 - $300,000']
            ],
            total_rows: 3
          }
        ],
        navigation: []
      },
      meta: {
        'description': 'Minnesota State Government Technology Services RFP',
        'keywords': 'RFP, technology, cloud, infrastructure, Minnesota'
      },
      screenshot: '/demo-screenshot.png',
      statistics: {
        total_links: 2,
        total_forms: 1,
        total_images: 0,
        total_tables: 1,
        text_length: 1250
      }
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

  // Simulate AI analysis of scraped content
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