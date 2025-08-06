
interface SAMOpportunity {
  noticeId: string;
  title: string;
  description: string;
  department: string;
  subTier: string;
  office: string;
  postedDate: string;
  responseDeadLine: string;
  naicsCode: string;
  classificationCode: string;
  active: string;
  award?: {
    amount: string;
    date: string;
    awardNumber: string;
  };
  pointOfContact?: Array<{
    fax: string;
    type: string;
    email: string;
    phone: string;
    title: string;
    fullName: string;
  }>;
  links?: Array<{
    rel: string;
    href: string;
  }>;
  additionalInfoLink?: string;
  uiLink?: string;
}

interface SAMApiResponse {
  _embedded?: {
    opportunities: SAMOpportunity[];
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

class SAMGovService {
  private baseApiUrl = 'https://api.sam.gov/opportunities/v2/search';
  private baseWebUrl = 'https://sam.gov';

  /**
   * Extract opportunity ID from various SAM.gov URL formats
   */
  extractOpportunityId(url: string): string | null {
    console.log('🔍 Extracting SAM.gov opportunity ID from:', url);
    
    // Pattern 1: /workspace/contract/opp/{id}/view
    const workspaceMatch = url.match(/\/workspace\/contract\/opp\/([a-f0-9-]+)\/view/i);
    if (workspaceMatch) {
      console.log('✅ Found workspace opportunity ID:', workspaceMatch[1]);
      return workspaceMatch[1];
    }
    
    // Pattern 2: /opp/{id}/view or /opportunities/{id}
    const oppMatch = url.match(/\/opp(?:ortunities)?\/([a-f0-9-]+)/i);
    if (oppMatch) {
      console.log('✅ Found opportunity ID:', oppMatch[1]);
      return oppMatch[1];
    }
    
    // Pattern 3: noticeId parameter
    const paramMatch = url.match(/[?&]noticeId=([a-f0-9-]+)/i);
    if (paramMatch) {
      console.log('✅ Found notice ID parameter:', paramMatch[1]);
      return paramMatch[1];
    }
    
    console.log('❌ No opportunity ID found in URL');
    return null;
  }

  /**
   * Check if URL is from SAM.gov
   */
  isSAMGovUrl(url: string): boolean {
    return url.toLowerCase().includes('sam.gov');
  }

  /**
   * Fetch opportunity data from SAM.gov public API
   */
  async fetchOpportunityById(opportunityId: string): Promise<SAMOpportunity | null> {
    try {
      console.log('🌐 Fetching SAM.gov opportunity via API:', opportunityId);
      
      const apiUrl = `${this.baseApiUrl}?noticeid=${opportunityId}&limit=1`;
      console.log('📡 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RFP-Analysis-Tool/1.0'
        }
      });
      
      if (!response.ok) {
        console.error('❌ SAM.gov API error:', response.status, response.statusText);
        return null;
      }
      
      const data: SAMApiResponse = await response.json();
      console.log('📊 SAM.gov API response:', data);
      
      const opportunities = data._embedded?.opportunities || [];
      if (opportunities.length === 0) {
        console.log('⚠️ No opportunities found for ID:', opportunityId);
        return null;
      }
      
      const opportunity = opportunities[0];
      console.log('✅ SAM.gov opportunity found:', opportunity.title);
      return opportunity;
      
    } catch (error) {
      console.error('💥 Error fetching SAM.gov opportunity:', error);
      return null;
    }
  }

  /**
   * Search for opportunities with enhanced filters
   */
  async searchOpportunities(params: {
    keywords?: string;
    department?: string;
    limit?: number;
    offset?: number;
  }): Promise<SAMOpportunity[]> {
    try {
      console.log('🔍 Searching SAM.gov opportunities:', params);
      
      const searchParams = new URLSearchParams({
        limit: (params.limit || 10).toString(),
        offset: (params.offset || 0).toString()
      });
      
      if (params.keywords) {
        searchParams.append('q', params.keywords);
      }
      
      if (params.department) {
        searchParams.append('deptname', params.department);
      }
      
      // Only search for active opportunities
      searchParams.append('active', 'true');
      
      const apiUrl = `${this.baseApiUrl}?${searchParams.toString()}`;
      console.log('📡 Search API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RFP-Analysis-Tool/1.0'
        }
      });
      
      if (!response.ok) {
        console.error('❌ SAM.gov search API error:', response.status);
        return [];
      }
      
      const data: SAMApiResponse = await response.json();
      const opportunities = data._embedded?.opportunities || [];
      
      console.log(`✅ Found ${opportunities.length} SAM.gov opportunities`);
      return opportunities;
      
    } catch (error) {
      console.error('💥 Error searching SAM.gov opportunities:', error);
      return [];
    }
  }

  /**
   * Convert SAM.gov opportunity to our ScrapeResult format
   */
  convertToScrapeResult(opportunity: SAMOpportunity, originalUrl: string): any {
    const fullText = `
${opportunity.title}

Department: ${opportunity.department}
Office: ${opportunity.office}
Sub-tier: ${opportunity.subTier}

Description:
${opportunity.description}

NAICS Code: ${opportunity.naicsCode}
Classification Code: ${opportunity.classificationCode}

Posted Date: ${opportunity.postedDate}
Response Deadline: ${opportunity.responseDeadLine}

Status: ${opportunity.active === 'Yes' ? 'Active' : 'Inactive'}

${opportunity.pointOfContact ? 
  opportunity.pointOfContact.map(contact => 
    `Contact: ${contact.fullName} (${contact.title})\nEmail: ${contact.email}\nPhone: ${contact.phone}`
  ).join('\n\n')
  : ''}

${opportunity.award ? 
  `Award Information:
Amount: ${opportunity.award.amount}
Date: ${opportunity.award.date}
Award Number: ${opportunity.award.awardNumber}`
  : ''}
    `.trim();

    return {
      status: 'success',
      url: originalUrl,
      final_url: opportunity.uiLink || originalUrl,
      title: opportunity.title,
      content: {
        text: {
          full_text: fullText,
          headings: [
            { level: 1, text: opportunity.title },
            { level: 2, text: 'Department Information' },
            { level: 2, text: 'Description' },
            { level: 2, text: 'Timeline' },
            { level: 2, text: 'Contact Information' }
          ],
          paragraphs: [
            opportunity.description,
            `Department: ${opportunity.department}`,
            `Office: ${opportunity.office}`,
            `Posted: ${opportunity.postedDate}`,
            `Deadline: ${opportunity.responseDeadLine}`
          ],
          lists: []
        },
        links: opportunity.links || [],
        forms: [],
        images: [],
        tables: [],
        navigation: []
      },
      meta: {
        'scraper': 'sam-gov-api',
        'source': 'SAM.gov Public API',
        'notice_id': opportunity.noticeId,
        'department': opportunity.department,
        'naics_code': opportunity.naicsCode,
        'classification_code': opportunity.classificationCode,
        'posted_date': opportunity.postedDate,
        'deadline': opportunity.responseDeadLine,
        'active': opportunity.active
      },
      statistics: {
        total_links: opportunity.links?.length || 0,
        total_forms: 0,
        total_images: 0,
        total_tables: 0,
        text_length: fullText.length
      }
    };
  }

  /**
   * Get demo SAM.gov URLs that are known to work
   */
  getDemoUrls(): Array<{ url: string; title: string; description: string }> {
    return [
      {
        url: 'https://sam.gov/opp/05255cc258ae40d2a5af9146663a89c5/view',
        title: 'Sample Federal Contract Opportunity',
        description: 'A working example from SAM.gov for demonstration'
      },
      {
        url: 'https://sam.gov/workspace/contract/opp/05255cc258ae40d2a5af9146663a89c5/view',
        title: 'Workspace Format URL',
        description: 'Alternative SAM.gov URL format'
      }
    ];
  }
}

export const samGovService = new SAMGovService();
export type { SAMOpportunity };
