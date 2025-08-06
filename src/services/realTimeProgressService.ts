
import { ScrapeResult } from './api';

export interface ProgressEvent {
  type: 'agent_start' | 'agent_complete' | 'analysis_complete' | 'error'
  agentId: number
  agentName: string
  progress: number
  status: 'pending' | 'running' | 'completed' | 'error'
  result?: string
  timestamp: number
  totalAgents: number
  error?: string
}

export interface AgentProgressCallback {
  (agentId: number, progress: number, status: 'pending' | 'running' | 'completed' | 'error', result?: string): void;
}

export interface AnalysisCompleteCallback {
  (results: any): void;
}

export interface ErrorCallback {
  (error: string): void;
}

class RealTimeProgressService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;

  async connectToAnalysis(
    progressCallback: AgentProgressCallback,
    completeCallback: AnalysisCompleteCallback,
    errorCallback: ErrorCallback
  ): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        // Use the actual Supabase project URL for WebSocket connection
        const wsUrl = 'wss://dywlonihwrnutwvzqivo.functions.supabase.co/rfp-realtime-analysis';
        console.log('🔗 Connecting to WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected for real-time analysis');
          this.reconnectAttempts = 0;
          resolve(this.ws!);
        };

        this.ws.onmessage = (event) => {
          try {
            const progressData: ProgressEvent = JSON.parse(event.data);
            console.log('📨 Received progress update:', progressData);

            switch (progressData.type) {
              case 'agent_start':
                console.log(`🚀 Agent ${progressData.agentId} (${progressData.agentName}) started`);
                progressCallback(progressData.agentId, progressData.progress, 'running');
                break;

              case 'agent_complete':
                console.log(`✅ Agent ${progressData.agentId} (${progressData.agentName}) completed`);
                progressCallback(progressData.agentId, progressData.progress, 'completed', progressData.result);
                break;

              case 'analysis_complete':
                console.log('🎉 Complete analysis finished');
                const results = JSON.parse(progressData.result || '{}');
                completeCallback(results);
                break;

              case 'error':
                console.error('❌ Analysis error:', progressData.error);
                if (progressData.agentId > 0) {
                  progressCallback(progressData.agentId, 0, 'error', progressData.error);
                } else {
                  errorCallback(progressData.error || 'Analysis failed');
                }
                break;
            }
          } catch (error) {
            console.error('Error parsing progress message:', error);
            errorCallback('Failed to parse progress update');
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          errorCallback('Connection error occurred');
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket connection closed:', event.code, event.reason);
          
          // Attempt to reconnect if not a clean close and we haven't exceeded attempts
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
              this.connectToAnalysis(progressCallback, completeCallback, errorCallback);
            }, this.reconnectDelay * this.reconnectAttempts);
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            errorCallback('Connection failed after multiple attempts');
          }
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  sendAnalysisRequest(rfpContent: ScrapeResult): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    console.log('📤 Sending analysis request for:', rfpContent.url);
    
    this.ws.send(JSON.stringify({
      type: 'start_analysis',
      rfpContent
    }));
  }

  disconnect(): void {
    if (this.ws) {
      console.log('🔌 Disconnecting WebSocket');
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const realTimeProgressService = new RealTimeProgressService();
