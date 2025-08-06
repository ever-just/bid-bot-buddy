
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
    description: "Extracting requirements and specifications using Claude AI",
    status: "pending",
    progress: 0,
    icon: "FileSearch",
    result: null
  },
  {
    id: 2,
    name: "Market Researcher",
    description: "Analyzing competitive landscape using Claude AI",
    status: "pending",
    progress: 0,
    icon: "TrendingUp",
    result: null
  },
  {
    id: 3,
    name: "Vendor Scout",
    description: "Identifying potential partners using Claude AI",
    status: "pending",
    progress: 0,
    icon: "Users",
    result: null
  },
  {
    id: 4,
    name: "Cost Estimator",
    description: "Calculating optimal pricing using Claude AI",
    status: "pending",
    progress: 0,
    icon: "DollarSign",
    result: null
  },
  {
    id: 5,
    name: "Compliance Checker",
    description: "Ensuring regulatory compliance using Claude AI",
    status: "pending",
    progress: 0,
    icon: "Bot",
    result: null
  },
  {
    id: 6,
    name: "Proposal Generator",
    description: "Creating final proposal using Claude AI",
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
};

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AgentState>(initialState);

  const startAnalysis = async (rfpData: ScrapeResult) => {
    setState(prev => ({
      ...prev,
      currentStep: 'processing',
      rfpData,
      isProcessing: true,
      error: null,
      agents: prev.agents.map(agent => ({ ...agent, status: 'pending', progress: 0, result: null }))
    }));

    try {
      // Start progress simulation
      const progressIntervals = anthropicAgentService.simulateProgressUpdates(
        (agentId, progress, status, result) => {
          updateAgentProgress(agentId, progress, status);
          if (result && status === 'completed') {
            setState(prev => ({
              ...prev,
              agents: prev.agents.map(agent =>
                agent.id === agentId
                  ? { ...agent, result: result.substring(0, 100) + '...' }
                  : agent
              )
            }));
          }
        }
      );

      // Run actual Anthropic analysis
      const results = await anthropicAgentService.analyzeRFPWithAgents(rfpData);
      
      // Clear progress intervals
      progressIntervals.forEach(interval => clearInterval(interval));
      
      // Update with real results
      setState(prev => ({
        ...prev,
        anthropicResults: results,
        currentStep: 'completed',
        isProcessing: false,
        agents: prev.agents.map((agent, index) => ({
          ...agent,
          status: 'completed' as const,
          progress: 100,
          result: Object.values(results.results)[index]?.substring(0, 150) + '...' || 'Analysis completed'
        }))
      }));

    } catch (error) {
      console.error('Analysis failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Analysis failed',
        isProcessing: false,
        currentStep: 'input',
        agents: prev.agents.map(agent => ({
          ...agent,
          status: 'error' as const,
          result: 'Analysis failed'
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
    setState(initialState);
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
