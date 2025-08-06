
import { supabase } from '@/integrations/supabase/client';

export interface RFPAnalysisRecord {
  id: string;
  url: string;
  title?: string;
  status: string;
  scraped_content?: any;
  analysis_results?: any;
  anthropic_results?: any;
  agents_completed: number;
  processing_time_ms?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentSessionRecord {
  id: string;
  rfp_analysis_id: string;
  agent_id: number;
  agent_name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  result?: string;
  processing_time_ms?: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

class DatabaseService {
  async storeAnthropicResults(analysisId: string, results: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('rfp_analyses')
        .update({
          anthropic_results: results,
          agents_completed: results.agents_completed || 0,
          processing_time_ms: results.total_processing_time,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId);

      if (error) {
        console.error('Failed to store Anthropic results:', error);
        throw error;
      }

      console.log('✅ Anthropic results stored in database for analysis:', analysisId);
    } catch (error) {
      console.error('Database error storing Anthropic results:', error);
      throw error;
    }
  }

  async createAgentSession(
    rfpAnalysisId: string,
    agentId: number,
    agentName: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .insert({
          rfp_analysis_id: rfpAnalysisId,
          agent_id: agentId,
          agent_name: agentName,
          status: 'pending',
          progress: 0
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to create agent session:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Database error creating agent session:', error);
      throw error;
    }
  }

  async updateAgentSession(
    sessionId: string,
    updates: {
      status?: 'pending' | 'running' | 'completed' | 'error';
      progress?: number;
      result?: string;
      processing_time_ms?: number;
      started_at?: string;
      completed_at?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('agent_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) {
        console.error('Failed to update agent session:', error);
        throw error;
      }

      console.log(`📊 Agent session ${sessionId} updated:`, updates);
    } catch (error) {
      console.error('Database error updating agent session:', error);
      throw error;
    }
  }

  async getAgentSessions(rfpAnalysisId: string): Promise<AgentSessionRecord[]> {
    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('rfp_analysis_id', rfpAnalysisId)
        .order('agent_id');

      if (error) {
        console.error('Failed to fetch agent sessions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Database error fetching agent sessions:', error);
      return [];
    }
  }

  async getRFPAnalysis(id: string): Promise<RFPAnalysisRecord | null> {
    try {
      const { data, error } = await supabase
        .from('rfp_analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No row found
          return null;
        }
        console.error('Failed to fetch RFP analysis:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Database error fetching RFP analysis:', error);
      return null;
    }
  }

  async getRecentAnalyses(limit: number = 10): Promise<RFPAnalysisRecord[]> {
    try {
      const { data, error } = await supabase
        .from('rfp_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch recent analyses:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Database error fetching recent analyses:', error);
      return [];
    }
  }

  async getScrapingStats(): Promise<{
    totalScrapingAttempts: number;
    successfulScrapes: number;
    averageResponseTime: number;
    scraperTypeStats: Record<string, { attempts: number; success_rate: number }>;
  }> {
    try {
      const { data: attempts, error } = await supabase
        .from('scraping_attempts')
        .select('scraper_type, success, duration_ms')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Failed to fetch scraping stats:', error);
        throw error;
      }

      const totalAttempts = attempts?.length || 0;
      const successful = attempts?.filter(a => a.success).length || 0;
      const avgTime = totalAttempts > 0 
        ? (attempts?.reduce((sum, a) => sum + a.duration_ms, 0) || 0) / totalAttempts
        : 0;

      const scraperStats: Record<string, { attempts: number; success_rate: number }> = {};
      ['browserql', 'enhanced', 'basic'].forEach(type => {
        const typeAttempts = attempts?.filter(a => a.scraper_type === type) || [];
        const typeSuccessful = typeAttempts.filter(a => a.success).length;
        scraperStats[type] = {
          attempts: typeAttempts.length,
          success_rate: typeAttempts.length > 0 ? (typeSuccessful / typeAttempts.length) * 100 : 0
        };
      });

      return {
        totalScrapingAttempts: totalAttempts,
        successfulScrapes: successful,
        averageResponseTime: avgTime,
        scraperTypeStats: scraperStats
      };
    } catch (error) {
      console.error('Database error fetching scraping stats:', error);
      return {
        totalScrapingAttempts: 0,
        successfulScrapes: 0,
        averageResponseTime: 0,
        scraperTypeStats: {}
      };
    }
  }
}

export const databaseService = new DatabaseService();
