
# Systematic Testing Plan

## Phase 1: Evidence Gathering (Immediate)

### API Testing Suite
- [ ] **Test 1:** Direct Browserless.io API connectivity test
  - Tools: curl, Postman
  - Target: Basic endpoint health
  - Timeline: 15 minutes

- [ ] **Test 2:** Parameter validation test
  - Test each parameter individually
  - Identify which parameters cause 400 errors
  - Timeline: 30 minutes

- [ ] **Test 3:** Documentation verification
  - Compare our implementation with official docs
  - Check for API version changes
  - Timeline: 20 minutes

### Target Site Analysis
- [ ] **Test 4:** Manual Minnesota portal access
  - Browser-based testing
  - Network tab analysis
  - Authentication flow mapping
  - Timeline: 30 minutes

### System Component Testing
- [ ] **Test 5:** Individual scraper tier testing
  - Test each tier in isolation
  - Use simple test sites (httpbin.org)
  - Verify fallback logic
  - Timeline: 45 minutes

## Phase 2: Root Cause Analysis (Short-term)

### 5 Whys Analysis Template
```
Problem: Browserless.io scraper fails with 403/400 errors

Why 1: API returns parameter validation error
  → Why 2: Parameters "setUserAgent" and "setCookie" not allowed
    → Why 3: Using deprecated API parameters
      → Why 4: Implementation based on old documentation
        → Why 5: No API version checking in implementation

Root Cause: API parameter mismatch due to version differences
```

### Component Isolation Testing
- [ ] **Test 6:** Database connectivity
- [ ] **Test 7:** Supabase function deployment
- [ ] **Test 8:** WebSocket stability
- [ ] **Test 9:** Error handling paths

## Phase 3: Hypothesis Testing (Progressive)

### Hypothesis 1: API Configuration Issue
**Test Matrix:**
```
| Parameter Set | Endpoint | Expected | Actual | Status |
|---------------|----------|----------|---------|---------|
| Minimal       | /content | 200 OK   | TBD    | 🔴     |
| Current       | /content | 200 OK   | 400    | ❌     |
| Alternative   | /scrape  | 200 OK   | TBD    | 🔴     |
```

### Hypothesis 2: Authentication Barriers
**Test Sites Hierarchy:**
1. **Simple:** httpbin.org/html (no auth required)
2. **Medium:** news site with paywall
3. **Complex:** Minnesota portal (enterprise auth)

### Hypothesis 3: Rate Limiting
**Test Pattern:**
- Single request → Success/Failure
- Burst requests → Rate limiting detection
- Different IPs → IP-based restrictions

## Phase 4: Solution Implementation (Systematic)

### Fix Implementation Order
1. **Critical Path:** Browserless.io API fix
2. **Essential:** Error handling enhancement  
3. **Important:** Database persistence
4. **Nice-to-have:** Performance optimization

### Verification Testing
- [ ] **Test 10:** Fix verification with test suite
- [ ] **Test 11:** Regression testing on existing functionality
- [ ] **Test 12:** Performance baseline establishment
- [ ] **Test 13:** Error scenario testing

## Phase 5: Monitoring & Prevention

### Monitoring Setup
- [ ] **Test 14:** API health monitoring
- [ ] **Test 15:** Error rate tracking
- [ ] **Test 16:** Performance metrics
- [ ] **Test 17:** Alert system testing

### Documentation Updates
- [ ] Update API integration docs
- [ ] Create troubleshooting runbook
- [ ] Document known issues and solutions
- [ ] Create performance baselines

## Test Execution Tracking

### Test Results Template
```markdown
## Test [X]: [Test Name]
**Date:** YYYY-MM-DD  
**Executor:** [Name]  
**Status:** 🔴 NOT_STARTED | 🟡 IN_PROGRESS | ✅ COMPLETE | ❌ FAILED  

### Execution Details
- **Duration:** XX minutes
- **Tools Used:** [List]
- **Environment:** [Details]

### Results
- **Outcome:** [Pass/Fail/Partial]
- **Key Findings:** [Bullet points]
- **Evidence:** [Links to logs/screenshots]

### Action Items
- [ ] Immediate action
- [ ] Follow-up investigation
- [ ] Documentation update

### Next Test
- **Depends On:** Test [Y]
- **Blocks:** Test [Z]
```

## Risk Assessment

### High Risk Tests
- Direct production API testing (use test keys)
- Load testing (may trigger rate limits)
- Authentication testing (may get blocked)

### Mitigation Strategies
- Use test/sandbox environments where possible
- Implement request throttling
- Have rollback plans ready
- Monitor system health during testing

## Success Criteria

### Phase 1 Success
- All evidence gathered and documented
- Root cause hypotheses formed
- Test matrix completed

### Phase 2 Success  
- Root cause identified with evidence
- Solution approach validated
- Implementation plan created

### Phase 3 Success
- Working Browserless.io integration
- Improved content extraction
- Enhanced error handling

### Final Success
- >90% success rate on target URLs
- <5 second average response time
- Comprehensive monitoring in place
- Full documentation updated
