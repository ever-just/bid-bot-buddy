import { useState } from "react";
import { Upload, Link as LinkIcon, FileText, Globe, Loader2, AlertCircle, CheckCircle, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { useAgent } from "@/contexts/AgentContext";
import { samGovService } from "@/services/samGovService";

const RFPInput = () => {
  const [rfpUrl, setRfpUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState("");
  const [scrapingStage, setScrapingStage] = useState<'connecting' | 'browserless' | 'enhanced' | 'basic' | 'validating' | 'success' | 'error' | ''>('');
  const { toast } = useToast();
  const { startAnalysis } = useAgent();

  const handleUrlSubmit = async () => {
    if (!rfpUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid RFP URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setScrapingStage('connecting');
    
    // Check if it's a SAM.gov URL for better status messaging
    const isSAMGov = samGovService.isSAMGovUrl(rfpUrl);
    
    if (isSAMGov) {
      setScrapingStatus("🏛️ SAM.gov detected: Attempting direct API access...");
    } else {
      setScrapingStatus("Initializing advanced scraping system...");
    }
    
    try {
      if (isSAMGov) {
        setScrapingStage('browserless');
        setScrapingStatus("🏛️ SAM.gov API: Extracting opportunity data directly from government database...");
      } else {
        setScrapingStage('browserless');
        setScrapingStatus("🚀 Browserless.io: Advanced browser automation with authentication bypass...");
      }
      
      const result = await apiService.scrapeRFP(rfpUrl);
      
      if (result.status === 'error') {
        setScrapingStage('error');
        throw new Error(result.error || 'Failed to scrape RFP');
      }

      setScrapingStage('validating');
      setScrapingStatus("Validating extracted content...");
      
      // Validate that we got actual content
      const contentLength = result.content?.text?.full_text?.length || 0;
      if (contentLength < 50) {
        setScrapingStage('error');
        throw new Error('Very little content was extracted from this URL. The page may be empty or have severe access restrictions.');
      }

      setScrapingStage('success');
      const scraperUsed = result.meta?.scraper || 'advanced-scraper';
      
      if (isSAMGov && scraperUsed === 'sam-gov-api') {
        setScrapingStatus(`✅ Successfully extracted ${contentLength} characters from SAM.gov API! Starting Claude AI analysis...`);
      } else {
        setScrapingStatus(`Successfully extracted ${contentLength} characters using ${scraperUsed}!`);
      }

      toast({
        title: "RFP Content Extracted",
        description: `Successfully extracted ${contentLength} characters using ${scraperUsed}. Starting Claude AI analysis...`,
      });

      startAnalysis(result);
      
    } catch (error) {
      console.error("Error scraping RFP:", error);
      setScrapingStage('error');
      setScrapingStatus("");
      
      toast({
        title: "Scraping Failed",
        description: error instanceof Error ? error.message : "Failed to extract content from the URL. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const insertDemoUrl = (demoUrl: string) => {
    setRfpUrl(demoUrl);
    toast({
      title: "Demo URL Inserted",
      description: "Click 'Extract & Analyze' to test with this working example",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File Selected",
        description: `Selected ${file.name}. Click 'Process Document' to analyze.`,
      });
    }
  };

  const handleFileProcess = () => {
    if (!uploadedFile) return;
    
    toast({
      title: "File Processing Not Implemented",
      description: "File upload processing will be implemented in the next update. Please use URL input for now.",
      variant: "destructive",
    });
  };

  const getStageIcon = () => {
    switch (scrapingStage) {
      case 'connecting':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
      case 'browserless':
        return <Zap className="h-3 w-3 text-purple-500" />;
      case 'enhanced':
        return <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />;
      case 'basic':
        return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
      case 'validating':
        return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Submit Your RFP</h2>
        <p className="text-muted-foreground">
          SAM.gov API + Browserless.io + Enhanced Scraping + Claude AI multi-agent analysis
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-sm text-blue-600 font-medium">SAM.gov API Integration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-sm text-purple-600 font-medium">Browserless.io Browser Automation</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="url" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            URL Input
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            File Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rfp-url">RFP URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="rfp-url"
                      type="url"
                      placeholder="https://sam.gov/opp/[opportunity-id]/view"
                      value={rfpUrl}
                      onChange={(e) => setRfpUrl(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  <Button onClick={handleUrlSubmit} disabled={!rfpUrl || isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Extract & Analyze"
                    )}
                  </Button>
                </div>
                
                {scrapingStatus && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getStageIcon()}
                    {scrapingStatus}
                  </div>
                )}
              </div>

              {/* Demo URLs Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Try these working examples:</h4>
                <div className="grid gap-2">
                  {samGovService.getDemoUrls().map((demo, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{demo.title}</p>
                        <p className="text-xs text-muted-foreground">{demo.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => insertDemoUrl(demo.url)}
                        disabled={isLoading}
                      >
                        Use This
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-2 bg-accent/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Any SAM.gov Opportunity</p>
                      <p className="text-xs text-muted-foreground">Works with any sam.gov opportunity URL</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('https://sam.gov/search/?index=opp&page=1', '_blank')}
                    >
                      Browse SAM.gov
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Advanced 4-Tier Extraction System:</p>
                    <p>• 🏛️ <span className="text-blue-600 font-medium">Tier 0: SAM.gov API</span> - Direct access to government contract database (most reliable)</p>
                    <p>• 🚀 <span className="text-purple-600 font-medium">Tier 1: Browserless.io</span> - Real Chrome browser automation, handles JavaScript & authentication</p>
                    <p>• 🔄 <span className="text-blue-600 font-medium">Tier 2: Enhanced Scraper</span> - User agent rotation, retry logic, content extraction</p>
                    <p>• 📝 <span className="text-yellow-600 font-medium">Tier 3: Basic Scraper</span> - Simple HTTP requests for basic sites</p>
                    <p>• 🤖 <span className="text-green-600 font-medium">Claude AI Multi-Agent</span> - 6 specialized agents analyze extracted content</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rfp-file">Upload RFP Document</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your RFP document here, or click to browse
                    </p>
                    <Input
                      id="rfp-file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{uploadedFile.name}</span>
                  </div>
                  <Button size="sm" onClick={handleFileProcess}>Process Document</Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RFPInput;
