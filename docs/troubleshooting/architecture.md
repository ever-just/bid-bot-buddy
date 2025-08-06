
# RFP Scraper System Architecture

## Current System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │  External APIs  │
│   (React)       │    │   Functions     │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • RFPInput      │    │ • browserless-  │    │ • Browserless   │
│ • Dashboard     │    │   scraper       │    │ • Anthropic     │
│ • Results       │    │ • advanced-     │    │ • Target Sites  │
│ • WebSocket     │    │   scraper       │    │                 │
│   Client        │    │ • web-scraper   │    │                 │
│                 │    │ • rfp-realtime- │    │                 │
│                 │    │   analysis      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (Supabase)    │
                    ├─────────────────┤
                    │ • No tables     │
                    │   currently     │
                    │ • Secrets only  │
                    └─────────────────┘
```

## Component Analysis

### Frontend Components
- **Location:** `src/components/agent/`
- **Key Files:** `RFPInput.tsx`, `AgentDashboard.tsx`
- **Status:** ✅ WORKING
- **Issues:** None major

### Scraper Tier System

#### Tier 1: Browserless.io Scraper
- **File:** `supabase/functions/browserless-scraper/index.ts`
- **Status:** 🔴 FAILING
- **Issues:** 
  - API parameter validation errors
  - Possibly wrong endpoint
  - Authentication issues

#### Tier 2: Enhanced Scraper
- **File:** `supabase/functions/advanced-scraper/index.ts`
- **Status:** 🟡 LIMITED
- **Issues:**
  - Detects authentication barriers
  - Falls back to basic scraper

#### Tier 3: Basic Scraper
- **File:** `supabase/functions/web-scraper/index.ts`
- **Status:** 🟢 WORKING
- **Issues:**
  - Very limited content extraction
  - No JavaScript execution

### Analysis System
- **File:** `supabase/functions/rfp-realtime-analysis/index.ts`
- **Status:** ✅ WORKING
- **Issues:** 
  - WebSocket disconnections (manageable)
  - Limited input content affects output quality

### API Service Layer
- **File:** `src/services/api.ts`
- **Status:** ✅ WORKING
- **Issues:** None major

## Data Flow Analysis

### Current Flow
```
User Input → RFPInput → API Service → Scraper Tiers → Analysis → Dashboard
     ↓
   URL Validation → Browserless (FAIL) → Enhanced (LIMITED) → Basic (MINIMAL)
     ↓
   WebSocket → Real-time Analysis → Agent Updates → UI Updates
```

### Ideal Flow
```
User Input → RFPInput → API Service → Browserless (SUCCESS) → Analysis → Dashboard
     ↓
   URL Validation → Full Content Extraction → Rich Analysis → Detailed Results
     ↓
   Database Storage → Historical Analysis → Performance Tracking
```

## Failure Points

### Primary Failure: Browserless.io Integration
- **Impact:** HIGH - Primary scraper non-functional
- **Root Cause:** API configuration mismatch
- **Cascade Effect:** Forces fallback to limited scrapers

### Secondary Issues
- **No Data Persistence:** No debugging history, no performance tracking
- **Authentication Handling:** Limited capability for protected sites
- **Error Recovery:** Basic fallback, no intelligent retry logic

## Dependencies

### External Services
- **Browserless.io:** PRIMARY (failing)
- **Anthropic Claude:** Secondary (working)
- **Supabase:** Infrastructure (working)

### Internal Dependencies
- **WebSocket Connection:** Real-time updates (working with reconnection)
- **Error Handling:** Basic (needs enhancement)
- **Logging:** Good (helps with debugging)

## Recommended Architecture Improvements

### Immediate (Fix Current Issues)
1. Fix Browserless.io API integration
2. Add database tables for persistence
3. Enhance error handling and recovery

### Short-term (Resilience)
1. Add request/response caching
2. Implement intelligent retry logic
3. Add performance monitoring
4. Create scraper health checks

### Long-term (Scalability)
1. Add more scraper providers
2. Implement scraper load balancing
3. Add ML-based content extraction
4. Create scraping performance optimization
