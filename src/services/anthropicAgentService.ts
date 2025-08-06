
import { supabase } from '@/integrations/supabase/client';
import { ScrapeResult } from './api';

export interface AnthropicAgentResult {
  success: boolean;
  results: Record<string, string>;
  executive_summary: string;
  agents_completed: number;
  rfp_url: string;
  error?: string;
}

export interface AgentProgressCallback {
  (agentId: number, progress: number, status: 'pending' | 'running' | 'completed' | 'error', result?: string): void;
}

class AnthropicAgentService {
  async analyzeRFPWithAgents(
    rfpContent: ScrapeResult, 
    progressCallback?: AgentProgressCallback
  ): Promise<AnthropicAgentResult> {
    try {
      console.log('🚀 Starting Anthropic multi-agent analysis for:', rfpContent.url);
      console.log('📄 RFP Content length:', rfpContent.content?.text?.full_text?.length || 0);

      // Validate input
      if (!rfpContent.content?.text?.full_text) {
        throw new Error('No RFP content found to analyze');
      }

      // Call the Supabase edge function
      console.log('🔄 Calling Supabase edge function...');
      const { data, error } = await supabase.functions.invoke('rfp-multi-agent', {
        body: {
          rfpContent: rfpContent
        }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Analysis failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from analysis');
      }

      if (!data.success) {
        console.error('❌ Analysis failed:', data.error);
        throw new Error(data.error || 'Analysis failed');
      }

      console.log('✅ Multi-agent analysis completed successfully');
      console.log('📊 Results summary:', {
        agents_completed: data.agents_completed,
        has_executive_summary: !!data.executive_summary,
        results_count: Object.keys(data.results || {}).length
      });

      return data as AnthropicAgentResult;

    } catch (error) {
      console.error('💥 Error in Anthropic agent analysis:', error);
      throw error;
    }
  }

  // Helper method to simulate progress updates for frontend
  simulateProgressUpdates(
    progressCallback: AgentProgressCallback,
    totalDuration: number = 25000 // Reduced to 25 seconds to better match real API timing
  ): NodeJS.Timeout[] {
    const agents = [1, 2, 3, 4, 5, 6];
    const intervals: NodeJS.Timeout[] = [];
    
    agents.forEach((agentId, index) => {
      const startTime = (index * totalDuration) / agents.length;
      const agentDuration = totalDuration / agents.length;
      
      // Start agent
      const startTimeout = setTimeout(() => {
        console.log(`🤖 Agent ${agentId} starting...`);
        progressCallback(agentId, 0, 'running');
        
        // Progress updates every 500ms
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - (Date.now() - agentDuration * 0.8); // Leave some buffer
          const progress = Math.min((elapsed / (agentDuration * 0.8)) * 100, 95);
          progressCallback(agentId, progress, 'running');
        }, 500);
        
        intervals.push(progressInterval);
        
        // Complete agent (slightly before the real one should complete)
        const completeTimeout = setTimeout(() => {
          clearInterval(progressInterval);
          console.log(`✅ Agent ${agentId} completed (simulated)`);
          progressCallback(agentId, 100, 'completed', `Agent ${agentId} analysis in progress...`);
        }, agentDuration * 0.9);
        
        intervals.push(completeTimeout);
        
      }, startTime);
      
      intervals.push(startTimeout);
    });
    
    return intervals;
  }

  // Cleanup method for intervals
  clearProgressIntervals(intervals: NodeJS.Timeout[]): void {
    intervals.forEach(interval => {
      clearTimeout(interval);
      clearInterval(interval);
    });
  }
}

export const anthropicAgentService = new AnthropicAgentService();
