import { Bot, FileSearch, TrendingUp, Users, DollarSign, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const agents = [
  {
    id: 1,
    name: "RFP Analyzer",
    description: "Extracting requirements and deadlines",
    status: "completed",
    progress: 100,
    icon: FileSearch,
    result: "Requirements extracted: 23 items"
  },
  {
    id: 2,
    name: "Market Researcher",
    description: "Analyzing market conditions and pricing",
    status: "running",
    progress: 75,
    icon: TrendingUp,
    result: "Market data: 15 competitors found"
  },
  {
    id: 3,
    name: "Vendor Scout",
    description: "Finding qualified subcontractors",
    status: "running",
    progress: 45,
    icon: Users,
    result: "Vendors identified: 8 potential partners"
  },
  {
    id: 4,
    name: "Cost Estimator",
    description: "Calculating optimal pricing strategy",
    status: "pending",
    progress: 0,
    icon: DollarSign,
    result: null
  },
  {
    id: 5,
    name: "Compliance Checker",
    description: "Ensuring regulatory compliance",
    status: "pending",
    progress: 0,
    icon: Bot,
    result: null
  },
  {
    id: 6,
    name: "Proposal Generator",
    description: "Creating final proposal document",
    status: "pending",
    progress: 0,
    icon: Clock,
    result: null
  }
];

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

const AgentDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">AI Agent Dashboard</h2>
        <p className="text-muted-foreground">
          Track the progress of our 6 specialized AI agents working on your RFP
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const IconComponent = agent.icon;
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
            <span>37%</span>
          </div>
          <Progress value={37} className="h-3" />
          <p className="text-sm text-muted-foreground">
            Estimated time remaining: 12 minutes
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AgentDashboard;