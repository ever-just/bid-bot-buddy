import { 
  FileSearch, 
  Search, 
  Users, 
  Calculator, 
  FileText, 
  Send,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WorkflowSection = () => {
  const agents = [
    {
      id: 1,
      name: "RFP Reader Agent",
      description: "Parses RFP documents and extracts key requirements, deadlines, and scope",
      icon: FileSearch,
      status: "Complete",
      color: "bg-success"
    },
    {
      id: 2,
      name: "Contract Researcher",
      description: "Searches historical contracts for pricing trends and market analysis",
      icon: Search,
      status: "In Development",
      color: "bg-warning"
    },
    {
      id: 3,
      name: "Vendor Scout",
      description: "Identifies and contacts relevant third-party vendors for quotes",
      icon: Users,
      status: "Planned",
      color: "bg-muted"
    },
    {
      id: 4,
      name: "Profit Estimator",
      description: "Calculates optimal pricing, markup, and profitability projections",
      icon: Calculator,
      status: "Planned",
      color: "bg-muted"
    },
    {
      id: 5,
      name: "Proposal Writer",
      description: "Generates professional RFP responses with compliance checking",
      icon: FileText,
      status: "Planned",
      color: "bg-muted"
    },
    {
      id: 6,
      name: "Submitter Agent",
      description: "Automates portal submission and tracks proposal status",
      icon: Send,
      status: "Planned",
      color: "bg-muted"
    }
  ];

  return (
    <section id="workflow" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Intelligent Agent Workflow
          </h2>
          <p className="text-lg text-muted-foreground">
            Six specialized AI agents work together to automate your entire RFP response process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {agents.map((agent, index) => (
            <Card key={agent.id} className="p-6 relative hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${agent.color}/10`}>
                  <agent.icon className={`h-6 w-6 ${
                    agent.status === 'Complete' ? 'text-success' :
                    agent.status === 'In Development' ? 'text-warning' :
                    'text-muted-foreground'
                  }`} />
                </div>
                <Badge variant={
                  agent.status === 'Complete' ? 'default' :
                  agent.status === 'In Development' ? 'secondary' :
                  'outline'
                } className="text-xs">
                  {agent.status}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{agent.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {agent.description}
              </p>
              
              {agent.status === 'Complete' && (
                <div className="flex items-center text-success text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Ready to use
                </div>
              )}
              
              {index < agents.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-primary/5 border-primary/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Complete Automation</h3>
              <p className="text-muted-foreground mb-6">
                From RFP URL to submitted proposal in under 2 hours. Our AI agents handle research, 
                vendor coordination, pricing optimization, and professional document generation.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success mr-2" />
                  80-90% time reduction
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success mr-2" />
                  Higher win rates
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success mr-2" />
                  Compliance guaranteed
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;