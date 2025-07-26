import { useState } from "react";
import { Upload, Link as LinkIcon, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const RFPInput = () => {
  const [rfpUrl, setRfpUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleUrlSubmit = () => {
    console.log("Analyzing RFP URL:", rfpUrl);
    // TODO: Integrate with backend scraping service
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      console.log("File uploaded:", file.name);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Submit Your RFP</h2>
        <p className="text-muted-foreground">
          Upload a document or provide a URL to start the automated analysis
        </p>
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
                      placeholder="https://example.com/rfp-document"
                      value={rfpUrl}
                      onChange={(e) => setRfpUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleUrlSubmit} disabled={!rfpUrl}>
                    Analyze RFP
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Supported formats: PDF, DOC, DOCX, HTML pages</p>
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
                  <Button size="sm">Process Document</Button>
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