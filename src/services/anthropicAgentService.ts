
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
      console.log('Starting Anthropic multi-agent analysis for:', rfpContent.url);

      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('rfp-multi-agent', {
        body: {
          rfpContent: rfpContent
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Analysis failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      console.log('Multi-agent analysis completed successfully');
      return data as AnthropicAgentResult;

    } catch (error) {
      console.error('Error in Anthropic agent analysis:', error);
      throw error;
    }
  }

  // Helper method to simulate progress updates for frontend
  simulateProgressUpdates(
    progressCallback: AgentProgressCallback,
    totalDuration: number = 30000
  ): NodeJS.Timeout[] {
    const agents = [1, 2, 3, 4, 5, 6];
    const intervals: NodeJS.Timeout[] = [];
    
    agents.forEach((agentId, index) => {
      const startTime = (index * totalDuration) / agents.length;
      const agentDuration = totalDuration / agents.length;
      
      // Start agent
      setTimeout(() => {
        progressCallback(agentId, 0, 'running');
        
        // Progress updates
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - (Date.now() - agentDuration);
          const progress = Math.min((elapsed / agentDuration) * 100, 95);
          progressCallback(agentId, progress, 'running');
        }, 500);
        
        intervals.push(progressInterval);
        
        // Complete agent
        setTimeout(() => {
          clearInterval(progressInterval);
          progressCallback(agentId, 100, 'completed', `Agent ${agentId} analysis completed`);
        }, agentDuration - 1000);
        
      }, startTime);
    });
    
    return intervals;
  }
}

export const anthropicAgentService = new AnthropicAgentService();
