import { useState } from "react";
import { ArrowLeft, Upload, Link as LinkIcon, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import AgentDashboard from "@/components/agent/AgentDashboard";
import RFPInput from "@/components/agent/RFPInput";
import ResultsPanel from "@/components/agent/ResultsPanel";

const Agent = () => {
  const [activeTab, setActiveTab] = useState("input");

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Landing
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold">RFP Agent Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input">RFP Input</TabsTrigger>
            <TabsTrigger value="dashboard">Agent Dashboard</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="mt-6">
            <RFPInput />
          </TabsContent>
          
          <TabsContent value="dashboard" className="mt-6">
            <AgentDashboard />
          </TabsContent>
          
          <TabsContent value="results" className="mt-6">
            <ResultsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Agent;