
import { Download, FileText, Share, Eye, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAgent } from "@/contexts/AgentContext";

const ResultsPanel = () => {
  const { state } = useAgent();
  const { anthropicResults } = state;

  if (!anthropicResults) {
    return (
      <div className="text-center py-12">
        <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Analysis Results</h3>
        <p className="text-muted-foreground">
          Please run an RFP analysis first to see results here.
        </p>
      </div>
    );
  }

  const agentNames = [
    "Requirements Analyst",
    "Market Researcher", 
    "Vendor Scout",
    "Cost Estimator",
    "Compliance Checker",
    "Proposal Generator"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">AI Analysis Results</h2>
        <p className="text-muted-foreground">
          Comprehensive RFP analysis powered by Claude AI multi-agent system
        </p>
        <Badge variant="secondary" className="mt-2">
          {anthropicResults.agents_completed} AI Agents Completed
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Executive Summary</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="market">Market & Costs</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Claude AI Executive Summary</h3>
              </div>
              <ScrollArea className="h-96 w-full rounded-md border p-4">
                <div className="whitespace-pre-wrap text-sm">
                  {anthropicResults.executive_summary}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="requirements" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Requirements Analysis</h3>
              <ScrollArea className="h-96 w-full rounded-md border p-4">
                <div className="whitespace-pre-wrap text-sm">
                  {anthropicResults.results["Requirements Analyst"] || "Analysis not available"}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="market" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Market Research & Cost Estimation</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Market Analysis</h4>
                  <ScrollArea className="h-48 w-full rounded-md border p-4">
                    <div className="whitespace-pre-wrap text-sm">
                      {anthropicResults.results["Market Researcher"] || "Analysis not available"}
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cost Estimation</h4>
                  <ScrollArea className="h-48 w-full rounded-md border p-4">
                    <div className="whitespace-pre-wrap text-sm">
                      {anthropicResults.results["Cost Estimator"] || "Analysis not available"}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="compliance" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Compliance & Vendor Analysis</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Compliance Requirements</h4>
                  <ScrollArea className="h-48 w-full rounded-md border p-4">
                    <div className="whitespace-pre-wrap text-sm">
                      {anthropicResults.results["Compliance Checker"] || "Analysis not available"}
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Vendor Recommendations</h4>
                  <ScrollArea className="h-48 w-full rounded-md border p-4">
                    <div className="whitespace-pre-wrap text-sm">
                      {anthropicResults.results["Vendor Scout"] || "Analysis not available"}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">AI-Generated Proposal</h3>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Bot className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-semibold">Claude AI Proposal</h4>
                  <p className="text-sm text-muted-foreground">Generated by AI • Ready for review</p>
                </div>
              </div>
              
              <ScrollArea className="h-32 w-full rounded-md border p-3 mb-3">
                <div className="whitespace-pre-wrap text-xs">
                  {anthropicResults.results["Proposal Generator"]?.substring(0, 300) + "..." || "Proposal generation completed"}
                </div>
              </ScrollArea>
              
              <div className="space-y-2">
                <Button className="w-full" size="sm" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF (Coming Soon)
                </Button>
                <Button variant="outline" className="w-full" size="sm" disabled>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview (Coming Soon)
                </Button>
                <Button variant="outline" className="w-full" size="sm" disabled>
                  <Share className="h-4 w-4 mr-2" />
                  Share (Coming Soon)
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">AI Agent Results</h4>
              <div className="space-y-2 text-sm">
                {agentNames.map((agentName, index) => (
                  <div key={agentName} className="flex justify-between items-center">
                    <span className="truncate">{agentName}</span>
                    <Badge variant="outline" className="text-xs">
                      {anthropicResults.results[agentName] ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              Analyzed: {new URL(anthropicResults.rfp_url).hostname}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResultsPanel;
