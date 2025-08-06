
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ScrapeResult, RFPAnalysis } from '@/services/api';
import { anthropicAgentService, AnthropicAgentResult } from '@/services/anthropicAgentService';

interface AgentState {
  currentStep: 'input' | 'processing' | 'completed';
  rfpData: ScrapeResult | null;
  analysis: RFPAnalysis | null;
  anthropicResults: AnthropicAgentResult | null;
  agents: AgentProgress[];
  isProcessing: boolean;
  error: string | null;
  processingStartTime: number | null;
}

interface AgentProgress {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  result: string | null;
  icon: string;
}

interface AgentContextType {
  state: AgentState;
  startAnalysis: (rfpData: ScrapeResult) => void;
  resetState: () => void;
  updateAgentProgress: (agentId: number, progress: number, status?: 'pending' | 'running' | 'completed' | 'error') => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

const initialAgents: AgentProgress[] = [
  {
    id: 1,
    name: "Requirements Analyst",
    description: "Extracting technical and functional requirements using Claude AI",
    status: "pending",
    progress: 0,
    icon: "FileSearch",
    result: null
  },
  {
    id: 2,
    name: "Market Researcher",
    description: "Analyzing competitive landscape and market conditions using Claude AI",
    status: "pending",
    progress: 0,
    icon: "TrendingUp",
    result: null
  },
  {
    id: 3,
    name: "Vendor Scout",
    description: "Identifying potential subcontractors and partners using Claude AI",
    status: "pending",
    progress: 0,
    icon: "Users",
    result: null
  },
  {
    id: 4,
    name: "Cost Estimator",
    description: "Calculating pricing strategies and cost estimates using Claude AI",
    status: "pending",
    progress: 0,
    icon: "DollarSign",
    result: null
  },
  {
    id: 5,
    name: "Compliance Checker",
    description: "Verifying regulatory and compliance requirements using Claude AI",
    status: "pending",
    progress: 0,
    icon: "Bot",
    result: null
  },
  {
    id: 6,
    name: "Proposal Generator",
    description: "Creating comprehensive proposal content using Claude AI",
    status: "pending",
    progress: 0,
    icon: "Clock",
    result: null
  }
];

const initialState: AgentState = {
  currentStep: 'input',
  rfpData: null,
  analysis: null,
  anthropicResults: null,
  agents: initialAgents,
  isProcessing: false,
  error: null,
  processingStartTime: null,
};

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AgentState>(initialState);

  const startAnalysis = async (rfpData: ScrapeResult) => {
    const startTime = Date.now();
    console.log('🎯 Starting REAL-TIME RFP analysis at:', new Date(startTime).toISOString());

    setState(prev => ({
      ...prev,
      currentStep: 'processing',
      rfpData,
      isProcessing: true,
      error: null,
      processingStartTime: startTime,
      agents: prev.agents.map(agent => ({ 
        ...agent, 
        status: 'pending', 
        progress: 0, 
        result: null 
      }))
    }));

    try {
      // Use real-time WebSocket service instead of simulation
      console.log('🔄 Calling real Anthropic API with WebSocket updates...');
      const results = await anthropicAgentService.analyzeRFPWithAgents(
        rfpData,
        // Real-time progress callback
        (agentId, progress, status, result) => {
          console.log(`📊 Real progress update - Agent ${agentId}: ${progress}% (${status})`);
          
          updateAgentProgress(agentId, progress, status);
          
          if (result && status === 'completed') {
            setState(prev => ({
              ...prev,
              agents: prev.agents.map(agent =>
                agent.id === agentId
                  ? { ...agent, result: result.length > 200 ? result.substring(0, 200) + '...' : result }
                  : agent
              )
            }));
          }
        }
      );
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      console.log(`⏱️ REAL analysis completed in ${duration.toFixed(1)} seconds`);
      
      // Update with real results from Claude
      setState(prev => ({
        ...prev,
        anthropicResults: results,
        currentStep: 'completed',
        isProcessing: false,
        agents: prev.agents.map((agent, index) => {
          const agentNames = [
            "Requirements Analyst",
            "Market Researcher", 
            "Vendor Scout",
            "Cost Estimator",
            "Compliance Checker",
            "Proposal Generator"
          ];
          const agentName = agentNames[index];
          const agentResult = results.results[agentName];
          
          return {
            ...agent,
            status: 'completed' as const,
            progress: 100,
            result: agentResult ? 
              (agentResult.length > 200 ? agentResult.substring(0, 200) + '...' : agentResult) : 
              'Analysis completed'
          };
        })
      }));

      console.log('🎉 Real-time RFP analysis completed successfully!');

    } catch (error) {
      console.error('💥 Real-time analysis failed:', error);
      
      // Ensure cleanup
      anthropicAgentService.disconnect();
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      console.log(`❌ Analysis failed after ${duration.toFixed(1)} seconds`);
      
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Analysis failed',
        isProcessing: false,
        currentStep: 'input',
        agents: prev.agents.map(agent => ({
          ...agent,
          status: 'error' as const,
          result: 'Analysis failed - please try again'
        }))
      }));
    }
  };

  const updateAgentProgress = (agentId: number, progress: number, status?: 'pending' | 'running' | 'completed' | 'error') => {
    setState(prev => ({
      ...prev,
      agents: prev.agents.map(agent =>
        agent.id === agentId
          ? { ...agent, progress, ...(status && { status }) }
          : agent
      )
    }));
  };

  const resetState = () => {
    console.log('🔄 Resetting agent state');
    // Ensure WebSocket is disconnected
    anthropicAgentService.disconnect();
    
    setState({
      ...initialState,
      agents: initialAgents.map(agent => ({ ...agent })) // Deep copy
    });
  };

  return (
    <AgentContext.Provider value={{
      state,
      startAnalysis,
      resetState,
      updateAgentProgress
    }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
