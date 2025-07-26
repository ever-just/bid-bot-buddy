# 🚀 RFP Automation Platform for Government Contracting

**Advanced AI-powered system for automating government RFP responses with intelligent web scraping, document analysis, and proposal generation.**

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/flask-3.1.1-green.svg)](https://flask.palletsprojects.com/)
[![Playwright](https://img.shields.io/badge/playwright-1.40.0-purple.svg)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🧠 **Project Overview**

This platform automates the complex process of responding to government RFPs (Requests for Proposals), specifically designed for Minnesota state contracts and expandable to other jurisdictions. The system uses AI-powered agents to transform manual RFP workflows into intelligent, automated processes.

### 🎯 **What It Does**

Users input a link to a public RFP, and the system automatically:

1. **📄 Parses & Extracts** RFP details (scope, requirements, deadlines)
2. **🔍 Researches** historical contract data and pricing trends  
3. **🏢 Identifies & Contacts** relevant third-party vendors (hotels, catering, etc.)
4. **💰 Estimates** pricing, markup, and profitability
5. **📝 Generates** professional proposal documents
6. **📤 Submits** proposals to procurement portals (optional)

### 🌟 **Current Features (Web Scraper Foundation)**

- **🌐 Universal URL Support**: Extract content from any government procurement website
- **📊 Comprehensive Data Extraction**: Text, links, forms, images, tables, and metadata
- **📷 Visual Documentation**: Automatic screenshot capture
- **🔗 Smart Link Analysis**: Categorizes internal vs external links
- **📋 Form Detection**: Identifies submission requirements and input fields
- **💾 Data Export**: JSON format with complete structured data
- **📱 Modern UI**: Responsive Bootstrap interface with real-time results

---

## 🏗️ **Architecture Overview**

| Component | Technology | Status |
|-----------|------------|--------|
| **Web Scraper** | Playwright + BeautifulSoup | ✅ **Complete** |
| **Agent System** | Modular Python classes | 🔄 **In Development** |
| **LLM Integration** | OpenAI GPT-4o | ⏳ **Planned** |
| **Document Parsing** | PyMuPDF + pdfplumber | ⏳ **Planned** |
| **Vendor Research** | Google Maps API | ⏳ **Planned** |
| **Proposal Generation** | Markdown → PDF | ⏳ **Planned** |
| **Database** | Supabase (Postgres) | ⏳ **Planned** |
| **Frontend** | Flask (current) → Next.js | 🔄 **Upgrading** |

---

## 🧩 **AI Agent System (Roadmap)**

### 1. **RFP Reader Agent** (`agents/rfp_reader.py`)
- **Input**: RFP URL (PDF or HTML)
- **Output**: Structured data (title, due date, scope, requirements, timeline)
- **Foundation**: Uses existing web scraper + PDF parsing

### 2. **Contract Researcher Agent** (`agents/contract_researcher.py`)  
- **Function**: Search USASpending, MN OpenGov, SAM.gov for similar contracts
- **Output**: Historical pricing, vendor analysis, market trends

### 3. **Vendor Scout Agent** (`agents/vendor_scout.py`)
- **Function**: Find and contact third-party vendors (hotels, catering, logistics)
- **Output**: Vendor contacts, quote requests, pricing estimates

### 4. **Profit Estimator Agent** (`agents/profit_estimator.py`)
- **Function**: Calculate costs, markup recommendations, risk assessment
- **Output**: Pricing strategy with profit projections

### 5. **Proposal Writer Agent** (`agents/proposal_writer.py`)
- **Function**: Generate professional RFP responses
- **Output**: Complete proposals (cover letter, scope, timeline, budget)

### 6. **Submitter Agent** (`agents/submitter.py`) 
- **Function**: Automated portal submission via browser automation
- **Output**: Submission confirmation and tracking

---

## 🚀 **Quick Start**

### **Current Web Scraper (Available Now)**

1. **Install Dependencies:**
   ```bash
   git clone https://github.com/ever-just/project-moose.git
   cd project-moose
   pip install -r requirements.txt
   python -m playwright install
   ```

2. **Run the Application:**
   ```bash
   python app.py
   ```

3. **Open in Browser:**
   ```
   http://localhost:8080
   ```

### **Test with Government Sites:**
Try these Minnesota procurement URLs:
- `https://guest.supplier.systems.state.mn.us/psc/fmssupap/SUPPLIER/ERP/c/SCP_PUBLIC_MENU_FL.SCP_PUB_BID_CMP_FL.GBL`
- `https://mn.gov/admin/osp/government/contracting/`

---

## 📁 **Project Structure**

```
project-moose/
├── app.py                 # Flask web application (current)
├── src/
│   └── web_scraper.py     # Core scraping engine ✅
├── agents/                # AI agent modules (planned)
│   ├── rfp_reader.py      # RFP document parser
│   ├── contract_researcher.py
│   ├── vendor_scout.py
│   ├── profit_estimator.py
│   ├── proposal_writer.py
│   └── submitter.py
├── templates/             # HTML templates ✅
│   ├── base.html
│   ├── index.html
│   └── error.html
├── static/                # Frontend assets ✅
│   ├── css/style.css
│   └── js/app.js
├── utils/                 # Utility modules (planned)
│   ├── pdf_tools.py
│   ├── email_templates.py
│   └── database.py
├── data/                  # Storage & examples (planned)
│   ├── examples/
│   └── temp_storage/
├── requirements.txt       # Python dependencies ✅
└── README.md             # This file ✅
```

---

## 🛠️ **Development Roadmap**

### **Phase 1: Foundation** ✅ **COMPLETE**
- [x] Web scraping engine (Playwright + BeautifulSoup)
- [x] Flask web interface
- [x] Document extraction and analysis
- [x] Screenshot capture
- [x] JSON data export

### **Phase 2: AI Integration** 🔄 **IN PROGRESS**
- [ ] OpenAI GPT-4o integration
- [ ] RFP document parsing agent
- [ ] PDF processing (PyMuPDF/pdfplumber)
- [ ] Structured data extraction

### **Phase 3: Research & Analysis** ⏳ **PLANNED**
- [ ] Contract research agent
- [ ] Historical data analysis
- [ ] Market pricing trends
- [ ] USASpending API integration

### **Phase 4: Vendor Management** ⏳ **PLANNED**
- [ ] Google Maps API integration
- [ ] Vendor discovery and contact
- [ ] Email automation
- [ ] Quote management system

### **Phase 5: Proposal Generation** ⏳ **PLANNED**
- [ ] AI-powered proposal writing
- [ ] Markdown to PDF conversion
- [ ] Template management
- [ ] Compliance checking

### **Phase 6: Portal Integration** ⏳ **PLANNED**
- [ ] Automated portal submission
- [ ] Multi-state support
- [ ] Submission tracking
- [ ] Status monitoring

---

## 💡 **Example Use Case**

**Input:** Minnesota state RFP for lodging services
```
https://mn.gov/admin/osp/government/contracting/requests-for-proposals.jsp?id=36-613711
```

**Automated Output:**
- ✅ **RFP Summary**: Lodging for 55 people in Soudan, MN (3 nights)
- ✅ **Historical Analysis**: 3 similar contracts, average cost $230/person
- ✅ **Vendor Research**: 5 local hotels identified + contact emails drafted
- ✅ **Pricing Strategy**: Recommended bid $14,800 | Expected profit $2,400
- ✅ **Proposal Document**: Professional PDF ready for submission
- ✅ **Portal Submission**: Automatically submitted (optional)

---

## 🔧 **Technical Requirements**

### **Current Dependencies**
```
playwright==1.40.0       # Web automation and scraping
flask==3.1.1             # Web framework  
beautifulsoup4==4.12.2   # HTML parsing
requests==2.31.0         # HTTP requests
pandas==2.1.4            # Data manipulation
```

### **Planned Dependencies**
```
openai>=1.0.0            # LLM integration
pymupdf>=1.23.0          # PDF processing
pdfplumber>=0.10.0       # PDF text extraction
supabase>=2.0.0          # Database and auth
googlemaps>=4.10.0       # Vendor research
weasyprint>=60.0         # PDF generation
```

---

## 🎯 **Goals & Impact**

### **Primary Goals**
- **⏱️ Time Savings**: Reduce RFP response time from days to hours
- **📈 Success Rate**: Increase proposal win rates through data-driven insights
- **🏢 Accessibility**: Enable small businesses to compete with large contractors
- **🤖 Automation**: Eliminate 80-90% of manual RFP workflow

### **Target Impact**
- **Small Businesses**: Level the playing field in government contracting
- **Government Agencies**: Receive higher quality, more competitive proposals
- **Economic Development**: Increase local business participation in public contracts

---

## 🔐 **Security & Compliance**

- **🔑 API Key Management**: Environment variables for all external services
- **🛡️ Data Security**: Encrypted storage of sensitive RFP and business data
- **📋 Audit Trail**: Complete logging of all agent actions and decisions
- **✅ Compliance**: Adherence to government procurement regulations
- **🔒 User Privacy**: Secure authentication and data isolation

---

## 📊 **API Documentation**

### **Current Endpoints**

```http
GET  /                    # Main web interface
POST /api/scrape         # Scrape webpage content
GET  /health             # Health check
GET  /screenshots/<file> # Serve screenshot files
```

### **Planned API Endpoints**

```http
POST /api/rfp/analyze    # Analyze RFP document
GET  /api/contracts      # Search historical contracts  
POST /api/vendors/search # Find relevant vendors
POST /api/proposal/generate # Generate proposal document
POST /api/submit         # Submit to procurement portal
```

---

## 🤝 **Contributing**

We welcome contributions! This project aims to democratize access to government contracting.

### **How to Contribute**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/agent-name`)
3. Commit your changes (`git commit -m 'Add new agent functionality'`)
4. Push to the branch (`git push origin feature/agent-name`)
5. Open a Pull Request

### **Development Areas**
- **🤖 AI Agent Development**: Build specialized agents for RFP processing
- **🌐 Frontend Enhancement**: Improve user interface and experience  
- **📊 Data Integration**: Connect to government databases and APIs
- **🔍 Testing**: Comprehensive testing across different RFP formats
- **📚 Documentation**: Improve setup guides and API documentation

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Minnesota State Government** for providing accessible procurement data
- **Open Source Community** for the foundational tools (Playwright, Flask, etc.)
- **Small Business Community** for inspiring this automation solution

---

## 📞 **Support & Contact**

- **Issues**: [GitHub Issues](https://github.com/ever-just/project-moose/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ever-just/project-moose/discussions)
- **Documentation**: [Project Wiki](https://github.com/ever-just/project-moose/wiki)

---

**Built with ❤️ for small businesses and government transparency**

🕷️ **Project Moose** - *Intelligent RFP Automation* 