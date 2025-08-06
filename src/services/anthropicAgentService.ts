
import { ScrapeResult } from './api';
import { realTimeProgressService, AgentProgressCallback } from './realTimeProgressService';

export interface AnthropicAgentResult {
  success: boolean;
  results: Record<string, string>;
  executive_summary: string;
  agents_completed: number;
  rfp_url: string;
  total_processing_time?: number;
  error?: string;
}

class AnthropicAgentService {
  async analyzeRFPWithAgents(
    rfpContent: ScrapeResult, 
    progressCallback?: AgentProgressCallback
  ): Promise<AnthropicAgentResult> {
    try {
      console.log('🚀 Starting real-time Anthropic analysis for:', rfpContent.url);
      console.log('📄 RFP Content length:', rfpContent.content?.text?.full_text?.length || 0);

      // Validate input
      if (!rfpContent.content?.text?.full_text) {
        throw new Error('No RFP content found to analyze');
      }

      // Create promises to handle the real-time analysis
      return new Promise<AnthropicAgentResult>((resolve, reject) => {
        const connectAndAnalyze = async () => {
          try {
            // Connect to WebSocket with callbacks
            await realTimeProgressService.connectToAnalysis(
              // Progress callback - called when agents start/complete
              (agentId, progress, status, result) => {
                console.log(`📊 Agent ${agentId} progress: ${progress}% (${status})`);
                if (progressCallback) {
                  progressCallback(agentId, progress, status, result);
                }
              },
              
              // Complete callback - called when entire analysis is done
              (results) => {
                console.log('🎉 Analysis completed with results:', results);
                realTimeProgressService.disconnect();
                
                resolve({
                  success: true,
                  results: results.results || {},
                  executive_summary: results.executive_summary || 'Analysis completed',
                  agents_completed: results.agents_completed || 6,
                  rfp_url: results.rfp_url || rfpContent.url,
                  total_processing_time: results.total_processing_time
                });
              },
              
              // Error callback - called on any error
              (error) => {
                console.error('❌ Real-time analysis error:', error);
                realTimeProgressService.disconnect();
                reject(new Error(error));
              }
            );

            // Send the analysis request
            realTimeProgressService.sendAnalysisRequest(rfpContent);
            console.log('📤 Analysis request sent via WebSocket');

          } catch (error) {
            console.error('💥 Error connecting to real-time service:', error);
            reject(error);
          }
        };

        connectAndAnalyze();
      });

    } catch (error) {
      console.error('💥 Error in Anthropic agent analysis:', error);
      throw error;
    }
  }

  // Remove all simulation methods - no longer needed with real WebSocket updates
  disconnect(): void {
    realTimeProgressService.disconnect();
  }
}

export const anthropicAgentService = new AnthropicAgentService();
