import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { 
  Globe, 
  Play, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText,
  Users,
  TrendingUp
} from "lucide-react";

const DemoSection = () => {
  const [rfpUrl, setRfpUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleAnalyze = () => {
    // Navigate to agent page with the URL
    navigate('/agent', { state: { rfpUrl } });
  };

  const exampleRfp = "https://mn.gov/admin/osp/government/contracting/requests-for-proposals.jsp";

  return (
    <section id="demo" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-lg text-muted-foreground">
            Try our web scraper engine with any government RFP URL
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Government RFP URL
                </label>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter RFP URL (e.g., Minnesota procurement portal)"
                      value={rfpUrl}
                      onChange={(e) => setRfpUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !rfpUrl}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Analyze RFP
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Try: {" "}
                  <button 
                    onClick={() => setRfpUrl(exampleRfp)}
                    className="text-primary hover:underline"
                  >
                    {exampleRfp}
                  </button>
                </p>
              </div>

              {isAnalyzing && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analyzing RFP...</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {progress < 40 && "Extracting RFP content and requirements..."}
                    {progress >= 40 && progress < 80 && "Analyzing document structure and forms..."}
                    {progress >= 80 && "Generating comprehensive analysis..."}
                  </div>
                </div>
              )}

              {analysisComplete && (
                <div className="space-y-6 border-t pt-6">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Analysis Complete</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">RFP Summary</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Title:</span>
                          <span>Lodging Services - Northern Minnesota</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Due Date:</span>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            15 days
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Scope:</span>
                          <span>55 people, 3 nights</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Market Analysis</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Similar Contracts:</span>
                          <span>3 found</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg. Cost/Person:</span>
                          <span className="font-medium">$230</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Recommended Bid:</span>
                          <Badge variant="default">
                            <DollarSign className="h-3 w-3 mr-1" />
                            $14,800
                          </Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Vendor Research</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hotels Found:</span>
                          <span>5 local options</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contacts Drafted:</span>
                          <Badge variant="outline">Ready to send</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span>2-3 business days</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Profit Projection</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Revenue:</span>
                          <span className="font-medium">$14,800</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated Costs:</span>
                          <span>$12,400</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expected Profit:</span>
                          <Badge variant="default" className="bg-success">
                            $2,400 (16%)
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="flex justify-center">
                    <Link to="/agent">
                      <Button className="bg-gradient-primary hover:opacity-90">
                        Generate Full Proposal
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;