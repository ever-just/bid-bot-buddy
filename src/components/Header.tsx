import { Bot, Github, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary animate-pulse-glow" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Project Moose
            </span>
          </div>
          <div className="hidden md:block">
            <span className="text-sm text-muted-foreground ml-2">
              AI-Powered RFP Automation
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#platform" className="text-sm font-medium hover:text-primary transition-colors">
            Platform
          </a>
          <a href="#workflow" className="text-sm font-medium hover:text-primary transition-colors">
            Workflow
          </a>
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </a>
          <a href="#demo" className="text-sm font-medium hover:text-primary transition-colors">
            Demo
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Button>
          <Button size="sm" className="bg-gradient-primary hover:opacity-90">
            Get Started
          </Button>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;