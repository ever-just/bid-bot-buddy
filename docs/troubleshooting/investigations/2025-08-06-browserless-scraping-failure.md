
# Investigation: Browserless.io Scraping Failure

**Investigation ID:** INV-2025-08-06-001  
**Status:** 🔴 ACTIVE  
**Priority:** HIGH  
**Investigator:** System  
**Started:** 2025-08-06 21:00:00 UTC  

## Problem Statement

The Browserless.io scraper is failing with 403 Forbidden errors when attempting to scrape RFP content from the Minnesota State portal.

## Evidence Collected

### Error Logs
```
❌ Browserless API error response: POST Body validation failed: "setUserAgent" is not allowed "setCookie" is not allowed
📡 Response status: 400
🔗 Endpoint URL: https://production-sfo.browserless.io/content?token=...
```

### System Behavior
- Primary scraper (Browserless.io): FAILS immediately
- Fallback to enhanced scraper: Detects authentication barrier
- Fallback to basic scraper: Extracts only 115 characters
- WebSocket connections: Disconnecting every ~75 seconds

### Target URL Analysis
**URL:** `https://guest.supplier.systems.state.mn.us/psc/fmssupap/SUPPLIER/ERP/c/SCP_PUBLIC_MENU_FL.SCP_PUB_BID_CMP_FL.GBL`

**Observations:**
- Contains "guest" in subdomain (may indicate public access)
- Complex parameter structure suggests enterprise system
- "SUPPLIER/ERP" suggests procurement system
- Returns "An error has occurred" with minimal content

## Hypotheses

### Primary Hypothesis: API Configuration Issue
- **Theory:** Using wrong API endpoint or parameters
- **Evidence:** 400/403 errors from Browserless.io
- **Test Plan:** Direct API testing with correct parameters

### Secondary Hypothesis: Target Site Authentication
- **Theory:** Site requires session/authentication even for "guest" access
- **Evidence:** "Login required" detection, minimal content extraction
- **Test Plan:** Manual browser testing, cookie analysis

### Tertiary Hypothesis: Rate Limiting/Blocking
- **Theory:** API or target site is blocking our requests
- **Evidence:** Consistent failures, user agent restrictions
- **Test Plan:** Different user agents, request patterns

## Action Items

### Immediate (Phase 1)
- [ ] Test Browserless.io API directly with curl
- [ ] Review official Browserless.io documentation
- [ ] Analyze Minnesota portal manually in browser
- [ ] Document exact error sequences

### Short-term (Phase 2)
- [ ] Implement API testing suite
- [ ] Create controlled test cases
- [ ] Set up proper monitoring
- [ ] Research Minnesota portal authentication

### Long-term (Phase 3)
- [ ] Implement robust error handling
- [ ] Add database persistence
- [ ] Create scraping performance dashboard
- [ ] Develop alternative scraping strategies

## Findings Log

### 2025-08-06 21:00 - Investigation Started
- Identified primary failure point: Browserless.io API
- Collected initial error logs and system behavior
- Established investigation framework

### Next Steps
1. Execute direct API testing
2. Document API requirements vs our implementation
3. Create test matrix for different scenarios
4. Implement fixes based on evidence

## Related Issues
- WebSocket connection instability
- Limited content extraction from fallback scrapers
- No data persistence for debugging
- Authentication barrier handling
