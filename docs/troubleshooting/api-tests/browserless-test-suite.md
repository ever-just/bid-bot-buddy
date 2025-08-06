
# Browserless.io API Test Suite

## Test Environment Setup

### Required Tools
- curl (command line)
- Postman (optional)
- Browser dev tools
- API key from Supabase secrets

### Test URLs
- **Primary:** `https://production-sfo.browserless.io`
- **Fallback:** `https://chrome.browserless.io`
- **Documentation:** `https://docs.browserless.io`

## Test Cases

### Test 1: Basic API Connectivity
```bash
# Test basic endpoint connectivity
curl -X GET "https://production-sfo.browserless.io/stats?token=YOUR_API_KEY"
```

**Expected:** API statistics response  
**Status:** 🔴 NOT_TESTED  

### Test 2: Content Endpoint with Minimal Parameters
```bash
# Test /content endpoint with minimal parameters
curl -X POST "https://production-sfo.browserless.io/content?token=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpbin.org/html"
  }'
```

**Expected:** HTML content extraction  
**Status:** 🔴 NOT_TESTED  

### Test 3: Content Endpoint with Target URL
```bash
# Test with actual Minnesota portal URL
curl -X POST "https://production-sfo.browserless.io/content?token=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://guest.supplier.systems.state.mn.us/psc/fmssupap/SUPPLIER/ERP/c/SCP_PUBLIC_MENU_FL.SCP_PUB_BID_CMP_FL.GBL",
    "gotoOptions": {
      "waitUntil": "networkidle2",
      "timeout": 30000
    }
  }'
```

**Expected:** Minnesota portal content  
**Status:** 🔴 NOT_TESTED  

### Test 4: Advanced Parameters (Current Implementation)
```bash
# Test with our current parameter set
curl -X POST "https://production-sfo.browserless.io/content?token=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpbin.org/html",
    "gotoOptions": {
      "waitUntil": "networkidle2",
      "timeout": 60000
    },
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }'
```

**Expected:** Success without parameter errors  
**Status:** 🔴 NOT_TESTED  

### Test 5: Alternative Endpoints
```bash
# Test /scrape endpoint instead of /content
curl -X POST "https://production-sfo.browserless.io/scrape?token=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpbin.org/html"
  }'
```

**Expected:** Alternative scraping method  
**Status:** 🔴 NOT_TESTED  

## Manual Browser Testing

### Minnesota Portal Analysis
1. **Manual Access Test**
   - Open target URL in clean browser session
   - Document what loads vs what requires authentication
   - Check network tab for additional requests
   - Note any JavaScript dependencies

2. **Session Requirements Test**
   - Test access with/without cookies
   - Try different user agents
   - Check for CSRF tokens or session requirements

3. **Content Loading Analysis**
   - Identify if content loads immediately or requires interaction
   - Check for lazy loading or infinite scroll
   - Document required wait times

## Results Documentation Template

### Test Result Format
```
### Test X: [Test Name]
**Date:** YYYY-MM-DD HH:MM UTC
**Status:** ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
**Response Code:** XXX
**Response Time:** XXXms
**Content Length:** XXX bytes

**Response Body:**
```
[First 200 characters of response]
```

**Notes:**
- Key observations
- Unexpected behaviors
- Recommendations

**Next Actions:**
- [ ] Action item 1
- [ ] Action item 2
```

## Automated Test Runner

Future enhancement: Create automated test runner that:
- Executes all test cases
- Compares results against baselines
- Generates reports
- Alerts on failures
- Tracks performance over time
