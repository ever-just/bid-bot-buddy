import { Download, FileText, Share, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ResultsPanel = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Analysis Results</h2>
        <p className="text-muted-foreground">
          Comprehensive RFP analysis and generated proposal ready for review
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">RFP Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Project Type:</span>
                  <span>IT Infrastructure Modernization</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Budget Range:</span>
                  <span>$500K - $2M</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Submission Deadline:</span>
                  <Badge variant="outline">March 15, 2024</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Project Duration:</span>
                  <span>12 months</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Key Requirements</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Cloud migration strategy and implementation</li>
                  <li>Security compliance (SOC 2, FISMA)</li>
                  <li>24/7 monitoring and support</li>
                  <li>Data backup and disaster recovery</li>
                  <li>Staff training and documentation</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="market" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Market Analysis</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">15</div>
                    <div className="text-sm text-muted-foreground">Competitors Found</div>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">$1.2M</div>
                    <div className="text-sm text-muted-foreground">Average Bid</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Top Competitors</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>TechSolutions Corp</span>
                      <Badge variant="secondary">3 similar projects</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>CloudFirst Systems</span>
                      <Badge variant="secondary">2 similar projects</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="vendors" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Recommended Vendors</h3>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">SecureCloud Partners</h4>
                    <Badge variant="secondary">Certified</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Specializes in government cloud migrations</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">SOC 2</Badge>
                    <Badge variant="outline">FISMA</Badge>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">DataGuard Solutions</h4>
                    <Badge variant="secondary">Preferred</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Expert in backup and disaster recovery</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">24/7 Support</Badge>
                    <Badge variant="outline">Gov Contractor</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pricing" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Pricing Strategy</h3>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">Recommended Bid: $1,450,000</h4>
                  <p className="text-sm text-muted-foreground">
                    Competitive pricing with 18% margin, positioned above average market rate
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Cost Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Infrastructure & Migration</span>
                      <span>$850,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Implementation</span>
                      <span>$320,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Training & Support</span>
                      <span>$180,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contingency (7%)</span>
                      <span>$100,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Generated Proposal</h3>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-semibold">Full Proposal Document</h4>
                  <p className="text-sm text-muted-foreground">45 pages • PDF</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Document Sections</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Executive Summary</span>
                  <Badge variant="outline">Complete</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Technical Approach</span>
                  <Badge variant="outline">Complete</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Project Timeline</span>
                  <Badge variant="outline">Complete</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Cost Proposal</span>
                  <Badge variant="outline">Complete</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Team Qualifications</span>
                  <Badge variant="outline">Complete</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResultsPanel;