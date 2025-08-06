import { Bot, FileSearch, TrendingUp, Users, DollarSign, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAgent } from "@/contexts/AgentContext";
import { useState, useEffect } from "react";

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "running":
      return "bg-blue-500";
    default:
      return "bg-gray-300";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Completed</Badge>;
    case "running":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Running</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
};

const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    FileSearch,
    TrendingUp,
    Users,
    DollarSign,
    Bot,
    Clock
  };
  return icons[iconName] || Bot;
};

const AgentDashboard = () => {
  const { state } = useAgent();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Real-time elapsed time counter
  useEffect(() => {
    if (!state.isProcessing || !state.processingStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.processingStartTime!) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isProcessing, state.processingStartTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Real-Time AI Agent Dashboard</h2>
        <p className="text-muted-foreground">
          Track live progress of 6 Claude AI agents analyzing your RFP
        </p>
        {state.isProcessing && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-sm text-blue-600 font-medium">
              Processing... {formatTime(elapsedTime)}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.agents.map((agent) => {
          const IconComponent = getIconComponent(agent.icon);
          return (
            <Card key={agent.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(agent.status)}`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    {getStatusBadge(agent.status)}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {agent.description}
              </p>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{agent.progress}%</span>
                  </div>
                  <Progress value={agent.progress} className="h-2" />
                </div>

                {agent.result && (
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-sm font-medium text-accent-foreground">
                      {agent.result}
                    </p>
                  </div>
                )}

                {agent.status === 'running' && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span>Claude AI processing...</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Overall Progress</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Total Completion</span>
            <span>{Math.round(state.agents.reduce((acc, agent) => acc + agent.progress, 0) / state.agents.length)}%</span>
          </div>
          <Progress value={Math.round(state.agents.reduce((acc, agent) => acc + agent.progress, 0) / state.agents.length)} className="h-3" />
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {state.isProcessing ? 
                `Real-time processing... ${state.agents.filter(a => a.status === 'completed').length}/${state.agents.length} agents completed` :
                state.currentStep === 'completed' ? 'All agents completed!' : 'Ready to start real-time analysis'
              }
            </p>
            
            {state.isProcessing && (
              <div className="text-right text-sm">
                <div className="text-muted-foreground">Elapsed: {formatTime(elapsedTime)}</div>
                <div className="text-xs text-muted-foreground">Est. 2-3 minutes total</div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AgentDashboard;
