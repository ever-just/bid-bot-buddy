
-- Create table for storing RFP analyses
CREATE TABLE public.rfp_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  scraped_content JSONB,
  analysis_results JSONB,
  anthropic_results JSONB,
  agents_completed INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking scraping attempts
CREATE TABLE public.scraping_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  scraper_type TEXT NOT NULL CHECK (scraper_type IN ('browserql', 'enhanced', 'basic')),
  success BOOLEAN NOT NULL DEFAULT false,
  content_length INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER NOT NULL,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for agent processing sessions
CREATE TABLE public.agent_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfp_analysis_id UUID REFERENCES public.rfp_analyses(id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'error')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  result TEXT,
  processing_time_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_rfp_analyses_url ON public.rfp_analyses(url);
CREATE INDEX idx_rfp_analyses_status ON public.rfp_analyses(status);
CREATE INDEX idx_rfp_analyses_created_at ON public.rfp_analyses(created_at DESC);
CREATE INDEX idx_scraping_attempts_url ON public.scraping_attempts(url);
CREATE INDEX idx_scraping_attempts_scraper_type ON public.scraping_attempts(scraper_type);
CREATE INDEX idx_scraping_attempts_success ON public.scraping_attempts(success);
CREATE INDEX idx_scraping_attempts_created_at ON public.scraping_attempts(created_at DESC);
CREATE INDEX idx_agent_sessions_rfp_analysis_id ON public.agent_sessions(rfp_analysis_id);
CREATE INDEX idx_agent_sessions_status ON public.agent_sessions(status);

-- Enable Row Level Security (make public for now since no auth is implemented)
ALTER TABLE public.rfp_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since no authentication is implemented yet)
CREATE POLICY "Allow public access to rfp_analyses" ON public.rfp_analyses FOR ALL USING (true);
CREATE POLICY "Allow public access to scraping_attempts" ON public.scraping_attempts FOR ALL USING (true);
CREATE POLICY "Allow public access to agent_sessions" ON public.agent_sessions FOR ALL USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at
CREATE TRIGGER update_rfp_analyses_updated_at 
  BEFORE UPDATE ON public.rfp_analyses 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
