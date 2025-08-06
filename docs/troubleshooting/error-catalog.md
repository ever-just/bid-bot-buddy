
# Error Catalog

## Browserless.io API Errors

### Error: POST Body validation failed
**Code:** 400 Bad Request  
**Message:** `"setUserAgent" is not allowed "setCookie" is not allowed`  
**Context:** Browserless.io API request  
**First Seen:** 2025-08-06  
**Frequency:** Every request  

**Analysis:**
- API parameters `setUserAgent` and `setCookie` are rejected
- Suggests API version mismatch or incorrect parameter usage
- May indicate we're using legacy API format

**Resolution Status:** 🔴 UNRESOLVED  
**Action:** Review current API documentation and update parameters

### Error: Browserless API key issues
**Code:** 401/403  
**Context:** Authentication with Browserless.io  
**Potential Causes:**
- Invalid API key
- Expired subscription
- Wrong endpoint URL
- Rate limiting

**Resolution Status:** 🔴 NEEDS_INVESTIGATION

## Target Site Errors

### Error: Authentication barrier detected
**Message:** "Login required"  
**Context:** Enhanced scraper fallback  
**Sites Affected:** Minnesota State portal  

**Analysis:**
- Site requires authentication even for "guest" URLs
- Enterprise system with session management
- May need cookie/session handling

**Resolution Status:** 🟡 PARTIAL (fallback working)

### Error: Minimal content extraction
**Content Length:** 115 characters  
**Expected:** >1000 characters for RFP content  
**Context:** All scrapers  

**Analysis:**
- Site may be dynamically loaded
- Authentication required for full content
- Anti-scraping measures active

## System Errors

### Error: WebSocket disconnections
**Frequency:** Every ~75 seconds  
**Code:** 1006 (connection closed)  
**Context:** Real-time analysis WebSocket  

**Analysis:**
- Supabase Edge Function timeout
- Connection idle timeout
- Client-side reconnection working

**Resolution Status:** 🟡 MITIGATED (auto-reconnect)

## Error Classification

### 🔴 Critical - System Breaking
- Browserless.io API failures
- Authentication errors
- Database connection issues

### 🟡 Warning - Reduced Functionality
- Fallback scraper limitations
- WebSocket disconnections
- Content extraction issues

### 🟢 Info - Minor Issues
- Logging verbosity
- UI feedback delays
- Performance optimizations
