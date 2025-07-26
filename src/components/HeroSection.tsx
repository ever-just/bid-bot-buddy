import { ArrowRight, FileText, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-bg">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/20 bg-accent/50 text-accent-foreground text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2 text-primary" />
            Advanced AI-Powered RFP Automation
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Transform Government
            <span className="bg-gradient-primary bg-clip-text text-transparent block">
              Contracting Forever
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Automate RFP responses with intelligent web scraping, document analysis, and AI-powered proposal generation. 
            Turn days of work into hours with our advanced agent system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/agent">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-lg">
                Start Automating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/agent">
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 animate-float">
              <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smart RFP Analysis</h3>
              <p className="text-sm text-muted-foreground">
                AI agents extract requirements, deadlines, and scope from any RFP format
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 animate-float" style={{ animationDelay: '0.2s' }}>
              <TrendingUp className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Market Research</h3>
              <p className="text-sm text-muted-foreground">
                Automated vendor discovery and historical contract pricing analysis
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 animate-float" style={{ animationDelay: '0.4s' }}>
              <Zap className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Instant Proposals</h3>
              <p className="text-sm text-muted-foreground">
                Generate professional proposals with optimal pricing and compliance
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;