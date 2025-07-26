import { 
  Shield, 
  Zap, 
  Globe, 
  FileCheck, 
  TrendingUp, 
  Users, 
  Clock,
  DollarSign,
  Database,
  Bot
} from "lucide-react";
import { Card } from "@/components/ui/card";

const FeaturesSection = () => {
  const features = [
    {
      icon: Globe,
      title: "Universal Web Scraping",
      description: "Extract content from any government procurement website with advanced parsing capabilities",
      status: "Available"
    },
    {
      icon: Bot,
      title: "AI Agent Orchestration",
      description: "Six specialized agents work together to automate the entire RFP response workflow",
      status: "In Development"
    },
    {
      icon: FileCheck,
      title: "Document Intelligence",
      description: "Parse PDFs, forms, and requirements with 99% accuracy using advanced NLP",
      status: "Planned"
    },
    {
      icon: Database,
      title: "Historical Contract Analysis",
      description: "Access USASpending, SAM.gov, and state databases for market intelligence",
      status: "Planned"
    },
    {
      icon: Users,
      title: "Vendor Discovery",
      description: "Automatically identify and contact relevant third-party vendors for quotes",
      status: "Planned"
    },
    {
      icon: TrendingUp,
      title: "Profit Optimization",
      description: "AI-powered pricing recommendations with risk assessment and markup suggestions",
      status: "Planned"
    },
    {
      icon: Clock,
      title: "Deadline Management",
      description: "Never miss a submission deadline with automated tracking and reminders",
      status: "Planned"
    },
    {
      icon: Shield,
      title: "Compliance Checking",
      description: "Ensure proposals meet all requirements and government regulations",
      status: "Planned"
    },
    {
      icon: DollarSign,
      title: "ROI Analytics",
      description: "Track win rates, profit margins, and optimize your bidding strategy",
      status: "Planned"
    }
  ];

  const currentFeatures = [
    "📄 Universal document extraction from any website",
    "📊 Comprehensive data analysis and structuring", 
    "📷 Automatic screenshot documentation",
    "🔗 Smart link categorization and analysis",
    "📋 Form detection and requirement mapping",
    "💾 Structured JSON export for integration"
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground">
            From web scraping to AI-powered proposal generation, we're building the complete automation platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${
                  feature.status === 'Available' ? 'bg-success/10' :
                  feature.status === 'In Development' ? 'bg-warning/10' :
                  'bg-muted/50'
                }`}>
                  <feature.icon className={`h-6 w-6 ${
                    feature.status === 'Available' ? 'text-success' :
                    feature.status === 'In Development' ? 'text-warning' :
                    'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feature.status === 'Available' ? 'bg-success/20 text-success' :
                      feature.status === 'In Development' ? 'bg-warning/20 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {feature.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-primary/5 border-primary/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-success">
                  ✅ Available Now - Web Scraper Engine
                </h3>
                <ul className="space-y-2">
                  {currentFeatures.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">
                  🚀 Coming Soon - Full AI Platform
                </h3>
                <p className="text-muted-foreground mb-4">
                  We're actively developing the complete AI agent system that will transform 
                  government contracting. Join our early access program to be the first to use:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• End-to-end RFP automation</li>
                  <li>• Intelligent vendor management</li>
                  <li>• AI-powered proposal generation</li>
                  <li>• Automated portal submission</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;