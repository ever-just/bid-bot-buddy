import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ScrapeResult, RFPAnalysis } from '@/services/api';

interface AgentState {
  currentStep: 'input' | 'processing' | 'completed';
  rfpData: ScrapeResult | null;
  analysis: RFPAnalysis | null;
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
    name: "RFP Analyzer",
    description: "Extracting requirements and deadlines",
    status: "pending",
    progress: 0,
    icon: "FileSearch",
    result: null
  },
  {
    id: 2,
    name: "Market Researcher",
    description: "Analyzing market conditions and pricing",
    status: "pending",
    progress: 0,
    icon: "TrendingUp",
    result: null
  },
  {
    id: 3,
    name: "Vendor Scout",
    description: "Finding qualified subcontractors",
    status: "pending",
    progress: 0,
    icon: "Users",
    result: null
  },
  {
    id: 4,
    name: "Cost Estimator",
    description: "Calculating optimal pricing strategy",
    status: "pending",
    progress: 0,
    icon: "DollarSign",
    result: null
  },
  {
    id: 5,
    name: "Compliance Checker",
    description: "Ensuring regulatory compliance",
    status: "pending",
    progress: 0,
    icon: "Bot",
    result: null
  },
  {
    id: 6,
    name: "Proposal Generator",
    description: "Creating final proposal document",
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
  agents: initialAgents,
  isProcessing: false,
  error: null,
};

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AgentState>(initialState);

  const startAnalysis = (rfpData: ScrapeResult) => {
    setState(prev => ({
      ...prev,
      currentStep: 'processing',
      rfpData,
      isProcessing: true,
      error: null,
      agents: prev.agents.map(agent => ({ ...agent, status: 'pending', progress: 0, result: null }))
    }));

    // Simulate agent processing
    simulateAgentProcessing();
  };

  const simulateAgentProcessing = () => {
    const agentProcessingTimes = [2000, 3000, 4000, 5000, 6000, 7000]; // Different completion times
    
    state.agents.forEach((agent, index) => {
      setTimeout(() => {
        // Start agent
        updateAgentProgress(agent.id, 0, 'running');
        
        // Progress updates
        const progressInterval = setInterval(() => {
          setState(prev => {
            const updatedAgents = prev.agents.map(a => {
              if (a.id === agent.id && a.status === 'running' && a.progress < 100) {
                return { ...a, progress: Math.min(a.progress + 20, 100) };
              }
              return a;
            });
            return { ...prev, agents: updatedAgents };
          });
        }, 500);

        // Complete agent
        setTimeout(() => {
          clearInterval(progressInterval);
          const results = [
            `Requirements extracted: ${Math.floor(Math.random() * 20) + 5} items`,
            `Market data: ${Math.floor(Math.random() * 10) + 5} competitors found`,
            `Vendors identified: ${Math.floor(Math.random() * 5) + 3} potential partners`,
            `Cost estimate: $${(Math.random() * 900000 + 100000).toLocaleString()}`,
            `Compliance check: ${Math.floor(Math.random() * 3) + 2} requirements verified`,
            `Proposal generated: ${Math.floor(Math.random() * 20) + 10} pages`
          ];
          
          setState(prev => {
            const updatedAgents = prev.agents.map(a => {
              if (a.id === agent.id) {
                return { ...a, status: 'completed' as const, progress: 100, result: results[index] };
              }
              return a;
            });
            
            // Check if all agents are completed
            const allCompleted = updatedAgents.every(a => a.status === 'completed');
            
            return {
              ...prev,
              agents: updatedAgents,
              currentStep: allCompleted ? 'completed' as const : prev.currentStep,
              isProcessing: !allCompleted
            };
          });
        }, agentProcessingTimes[index]);
        
      }, index * 1000); // Stagger agent starts
    });
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