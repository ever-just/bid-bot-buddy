"""
RFP Reader Agent - Phase 2: AI Integration

This agent parses and extracts structured data from RFP documents (PDF or HTML).
Built on top of the existing web scraper foundation from Phase 1.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path

# Current Phase 1 imports (working web scraper)
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))
from web_scraper import scrape_url

# Future Phase 2 imports (to be implemented)
# import openai
# import pymupdf
# import pdfplumber

logger = logging.getLogger(__name__)

class RFPReaderAgent:
    """
    AI-powered agent for reading and analyzing RFP documents.
    
    Capabilities:
    - Parse PDF and HTML RFP documents
    - Extract structured data (title, due date, scope, requirements)
    - Identify third-party dependencies (hotels, catering, etc.)
    - Generate confidence scores for extracted information
    """
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.openai_api_key = openai_api_key
        self.supported_formats = ['pdf', 'html', 'docx']
        
    async def analyze_rfp(self, url_or_path: str) -> Dict[str, Any]:
        """
        Main method to analyze an RFP document.
        
        Args:
            url_or_path: URL to RFP page or path to uploaded file
            
        Returns:
            Structured RFP data with extracted information
        """
        try:
            logger.info(f"🔍 Starting RFP analysis: {url_or_path}")
            
            # Phase 1: Use existing web scraper (WORKING)
            if url_or_path.startswith(('http://', 'https://')):
                scraped_data = await self._scrape_rfp_webpage(url_or_path)
            else:
                scraped_data = await self._parse_rfp_file(url_or_path)
            
            # Phase 2: AI Analysis (TO BE IMPLEMENTED)
            structured_data = await self._ai_analyze_content(scraped_data)
            
            # Phase 2: Confidence scoring (TO BE IMPLEMENTED) 
            confidence_scores = self._calculate_confidence(structured_data)
            
            return {
                "status": "success",
                "agent": "rfp_reader",
                "timestamp": datetime.now().isoformat(),
                "source": url_or_path,
                "data": structured_data,
                "confidence": confidence_scores,
                "raw_scraped": scraped_data  # Include raw data for debugging
            }
            
        except Exception as e:
            logger.error(f"❌ RFP analysis failed: {str(e)}")
            return {
                "status": "error",
                "agent": "rfp_reader", 
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _scrape_rfp_webpage(self, url: str) -> Dict[str, Any]:
        """
        Phase 1: Use existing web scraper (WORKING)
        Leverage the proven web scraper from project-moose
        """
        logger.info("📄 Using Phase 1 web scraper...")
        scraped_data = await scrape_url(url)
        
        # Extract relevant content for RFP analysis
        return {
            "source_type": "webpage",
            "url": url,
            "title": scraped_data.get("title", ""),
            "text_content": scraped_data.get("content", {}).get("text", {}),
            "links": scraped_data.get("content", {}).get("links", []),
            "forms": scraped_data.get("content", {}).get("forms", []),
            "tables": scraped_data.get("content", {}).get("tables", []),
            "meta": scraped_data.get("meta", {}),
            "screenshot": scraped_data.get("screenshot")
        }
    
    async def _parse_rfp_file(self, file_path: str) -> Dict[str, Any]:
        """
        Phase 2: Parse uploaded RFP files (PDF, DOCX)
        TO BE IMPLEMENTED with PyMuPDF/pdfplumber
        """
        logger.info("📁 Parsing uploaded RFP file...")
        
        # TODO Phase 2: Implement PDF parsing
        # if file_path.endswith('.pdf'):
        #     return self._parse_pdf(file_path)
        # elif file_path.endswith('.docx'):
        #     return self._parse_docx(file_path)
        
        return {
            "source_type": "file",
            "file_path": file_path,
            "status": "not_implemented",
            "note": "PDF parsing will be implemented in Phase 2"
        }
    
    async def _ai_analyze_content(self, raw_content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Phase 2: AI-powered content analysis with OpenAI
        TO BE IMPLEMENTED
        """
        logger.info("🧠 AI analysis starting...")
        
        # TODO Phase 2: Implement OpenAI integration
        # Extract structured data using GPT-4o:
        # - RFP title and reference number
        # - Due date and timeline
        # - Scope of work
        # - Requirements and specifications
        # - Eligibility criteria
        # - Third-party dependencies
        # - Budget range (if mentioned)
        # - Contact information
        
        # For now, return basic extracted data from web scraper
        text_content = raw_content.get("text_content", {})
        
        return {
            "title": raw_content.get("title", ""),
            "due_date": None,  # TODO: Extract with AI
            "scope_of_work": text_content.get("full_text", "")[:500] + "...",
            "requirements": [],  # TODO: Extract with AI
            "eligibility": [],   # TODO: Extract with AI
            "third_party_needs": [],  # TODO: Identify vendor requirements
            "contact_info": {},  # TODO: Extract contact details
            "budget_range": None,  # TODO: Extract if available
            "timeline": [],      # TODO: Extract key dates
            "status": "basic_extraction",
            "note": "Full AI analysis will be implemented in Phase 2"
        }
    
    def _calculate_confidence(self, structured_data: Dict[str, Any]) -> Dict[str, float]:
        """
        Phase 2: Calculate confidence scores for extracted information
        TO BE IMPLEMENTED
        """
        # TODO Phase 2: Implement confidence scoring
        # Based on:
        # - Text clarity and completeness
        # - Presence of key fields
        # - Consistency across document
        # - AI model confidence scores
        
        return {
            "overall": 0.7,  # Placeholder
            "title": 0.9,
            "due_date": 0.0,
            "scope": 0.5,
            "requirements": 0.0,
            "contact_info": 0.0
        }

# Convenience function for external use
async def analyze_rfp(url_or_path: str, openai_api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Convenience function to analyze an RFP document.
    
    Args:
        url_or_path: URL to RFP page or path to uploaded file
        openai_api_key: OpenAI API key for AI analysis
        
    Returns:
        Structured RFP analysis results
    """
    agent = RFPReaderAgent(openai_api_key)
    return await agent.analyze_rfp(url_or_path)

# Example usage for testing
if __name__ == "__main__":
    async def test_rfp_reader():
        """Test the RFP Reader with a Minnesota procurement URL"""
        test_url = "https://guest.supplier.systems.state.mn.us/psc/fmssupap/SUPPLIER/ERP/c/SCP_PUBLIC_MENU_FL.SCP_PUB_BID_CMP_FL.GBL"
        
        print("🧪 Testing RFP Reader Agent...")
        result = await analyze_rfp(test_url)
        
        print(f"✅ Status: {result['status']}")
        if result['status'] == 'success':
            print(f"📄 Title: {result['data']['title']}")
            print(f"📊 Confidence: {result['confidence']['overall']:.1%}")
        else:
            print(f"❌ Error: {result['error']}")
    
    # Run test
    asyncio.run(test_rfp_reader()) 