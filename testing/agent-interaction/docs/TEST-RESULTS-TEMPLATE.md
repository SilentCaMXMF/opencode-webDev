# Test Results Template

**Test Suite:** Frontend Design Agent System - Agent Interaction Tests
**Test Run ID:** {TEST_RUN_ID}
**Generated:** {TIMESTAMP}
**Test Suite Version:** 1.0.0

---

## Executive Summary

| Metric | Value |
|--------|--------|
| Total Tests Run | {TOTAL_TESTS} |
| Tests Passed | {PASSED_TESTS} |
| Tests Failed | {FAILED_TESTS} |
| Tests Skipped | {SKIPPED_TESTS} |
| Pass Rate | {PASS_RATE}% |
| Duration | {DURATION_MS}ms |
| Coverage | {COVERAGE_PERCENTAGE}% |

---

## Test Results by Category

### 1. Agent Communication Tests

| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| AC-HANDOFF-001 | Orchestrator to Design System handoff | {STATUS} | {DURATION}ms | {NOTES} |
| AC-HANDOFF-002 | Orchestrator to Component Developer handoff | {STATUS} | {DURATION}ms | {NOTES} |
| ... | ... | ... | ... | ... |

**Summary:**
- Total Tests: {TOTAL_COMM_TESTS}
- Passed: {COMM_PASSED}
- Failed: {COMM_FAILED}
- Pass Rate: {COMM_PASS_RATE}%

### 2. Context Sharing Tests

| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| CS-SYNC-001 | Agent can subscribe to context | {STATUS} | {DURATION}ms | {NOTES} |
| CS-SYNC-003 | Context changes propagated to subscribers | {STATUS} | {DURATION}ms | {NOTES} |
| ... | ... | ... | ... | ... |

**Summary:**
- Total Tests: {TOTAL_CS_TESTS}
- Passed: {CS_PASSED}
- Failed: {CS_FAILED}
- Pass Rate: {CS_PASS_RATE}%

### 3. Conflict Resolution Tests

| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| CR-PRIORITY-001 | Orchestrator decision wins | {STATUS} | {DURATION}ms | {NOTES} |
| CR-CONSENSUS-001 | Unanimous consensus achieved | {STATUS} | {DURATION}ms | {NOTES} |
| ... | ... | ... | ... | ... |

**Summary:**
- Total Tests: {TOTAL_CR_TESTS}
- Passed: {CR_PASSED}
- Failed: {CR_FAILED}
- Pass Rate: {CR_PASS_RATE}%

### 4. Decision Framework Tests

| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| DF-MULTI-001 | Votes counted correctly | {STATUS} | {DURATION}ms | {NOTES} |
| DF-EXPERT-001 | Experts identified correctly | {STATUS} | {DURATION}ms | {NOTES} |
| ... | ... | ... | ... | ... |

**Summary:**
- Total Tests: {TOTAL_DF_TESTS}
- Passed: {DF_PASSED}
- Failed: {DF_FAILED}
- Pass Rate: {DF_PASS_RATE}%

### 5. Tool Delegation Tests

| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| TD-USAGE-001 | Context7 tool delegated properly | {STATUS} | {DURATION}ms | {NOTES} |
| TD-SHARE-001 | Tool locking works | {STATUS} | {DURATION}ms | {NOTES} |
| ... | ... | ... | ... | ... |

**Summary:**
- Total Tests: {TOTAL_TD_TESTS}
- Passed: {TD_PASSED}
- Failed: {TD_FAILED}
- Pass Rate: {TD_PASS_RATE}%

### 6. Integration Tests

| Test ID | Test Name | Integration | Status | Duration | Notes |
|---------|-----------|-------------|--------|----------|-------|
| IT-INT-001 | Context7 orchestration | Context7 | {STATUS} | {DURATION}ms | {NOTES} |
| IT-INT-002 | Performance monitoring | Monitoring | {STATUS} | {DURATION}ms | {NOTES} |
| ... | ... | ... | ... | ... | ... |

**Summary:**
- Total Tests: {TOTAL_IT_TESTS}
- Passed: {IT_PASSED}
- Failed: {IT_FAILED}
- Pass Rate: {IT_PASS_RATE}%

### 7. Performance Tests

| Test ID | Test Name | Metric | Target | Actual | Status | Notes |
|---------|-----------|--------|--------|--------|--------|-------|
| PF-RESP-001 | Agent response time | avg_response_time | <500ms | {ACTUAL}ms | {STATUS} | {NOTES} |
| PF-RESP-002 | Handoff latency | handoff_latency | <200ms | {ACTUAL}ms | {STATUS} | {NOTES} |
| ... | ... | ... | ... | ... | ... | ... |

**Summary:**
- Total Tests: {TOTAL_PF_TESTS}
- Passed: {PF_PASSED}
- Failed: {PF_FAILED}
- Pass Rate: {PF_PASS_RATE}%

### 8. Load/Stress Tests

| Test ID | Test Name | Duration | Result | Notes |
|---------|-----------|----------|--------|-------|
| LS-001 | Sustained load (50% capacity) | {DURATION} | {RESULT} | {NOTES} |
| LS-002 | Peak load (100% capacity) | {DURATION} | {RESULT} | {NOTES} |
| ... | ... | ... | ... | ... |

**Summary:**
- Total Tests: {TOTAL_LS_TESTS}
- Passed: {LS_PASSED}
- Failed: {LS_FAILED}
- Pass Rate: {LS_PASS_RATE}%

---

## Coverage Report

| Metric | Lines | Functions | Branches | Statements |
|--------|--------|-----------|----------|-----------|
| Covered | {LINES_COVERED} | {FUNCS_COVERED} | {BRANCHES_COVERED} | {STATEMENTS_COVERED} |
| Total | {LINES_TOTAL} | {FUNCS_TOTAL} | {BRANCHES_TOTAL} | {STATEMENTS_TOTAL} |
| Percentage | {LINES_PCT}% | {FUNCS_PCT}% | {BRANCHES_PCT}% | {STATEMENTS_PCT}% |

### Coverage by Agent

| Agent | Coverage | Tests | Status |
|-------|----------|-------|--------|
| Orchestrator | {ORC_COVERAGE}% | {ORC_TESTS} | {STATUS} |
| Design System | {DS_COVERAGE}% | {DS_TESTS} | {STATUS} |
| Component Developer | {CD_COVERAGE}% | {CD_TESTS} | {STATUS} |
| Performance Optimizer | {PO_COVERAGE}% | {PO_TESTS} | {STATUS} |
| Accessibility Specialist | {AX_COVERAGE}% | {AX_TESTS} | {STATUS} |
| Cross-Platform Specialist | {CP_COVERAGE}% | {CP_TESTS} | {STATUS} |
| Testing & QA Specialist | {TQ_COVERAGE}% | {TQ_TESTS} | {STATUS} |
| Security Specialist | {SC_COVERAGE}% | {SC_TESTS} | {STATUS} |
| Animation Specialist | {AN_COVERAGE}% | {AN_TESTS} | {STATUS} |
| I18n Specialist | {I1_COVERAGE}% | {I1_TESTS} | {STATUS} |
| UX Research Specialist | {UR_COVERAGE}% | {UR_TESTS} | {STATUS} |

---

## Issues Found

### Critical Issues
| Issue ID | Description | Affected Tests | Affected Agents | Severity |
|----------|-------------|----------------|-----------------|----------|
| ISSUE-001 | {DESCRIPTION} | {TEST_IDS} | {AGENT_IDS} | CRITICAL |
| ... | ... | ... | ... | ... |

### High Severity Issues
| Issue ID | Description | Affected Tests | Affected Agents | Severity |
|----------|-------------|----------------|-----------------|----------|
| ISSUE-002 | {DESCRIPTION} | {TEST_IDS} | {AGENT_IDS} | HIGH |
| ... | ... | ... | ... | ... |

### Medium Severity Issues
| Issue ID | Description | Affected Tests | Affected Agents | Severity |
|----------|-------------|----------------|-----------------|----------|
| ISSUE-003 | {DESCRIPTION} | {TEST_IDS} | {AGENT_IDS} | MEDIUM |
| ... | ... | ... | ... | ... |

### Low Severity Issues
| Issue ID | Description | Affected Tests | Affected Agents | Severity |
|----------|-------------|----------------|-----------------|----------|
| ISSUE-004 | {DESCRIPTION} | {TEST_IDS} | {AGENT_IDS} | LOW |
| ... | ... | ... | ... | ... |

---

## Recommendations

### Immediate Actions (Next 1-3 Days)
1. {RECOMMENDATION_1}
2. {RECOMMENDATION_2}
3. {RECOMMENDATION_3}

### Short-Term Actions (Next 1-2 Weeks)
1. {RECOMMENDATION_4}
2. {RECOMMENDATION_5}
3. {RECOMMENDATION_6}

### Long-Term Actions (Next 1-3 Months)
1. {RECOMMENDATION_7}
2. {RECOMMENDATION_8}
3. {RECOMMENDATION_9}

---

## Sign-Off

| Role | Name | Date | Signature |
|-------|------|------|-----------|
| Test Lead | | | |
| QA Manager | | | |
| Tech Lead | | | |
| Product Owner | | | |

---

## Appendix

### A. Test Environment

| Component | Version |
|-----------|---------|
| Node.js | {NODE_VERSION} |
| npm | {NPM_VERSION} |
| Vitest | {VITEST_VERSION} |
| TypeScript | {TS_VERSION} |
| OS | {OS_VERSION} |
| CPU | {CPU_INFO} |
| Memory | {MEMORY_INFO} |

### B. Configuration Files Used

- package.json: {PACKAGE_JSON_HASH}
- tsconfig.json: {TSCONFIG_HASH}
- vitest.config.ts: {VITEST_CONFIG_HASH}

### C. Artifacts Generated

- Test Results JSON: {TEST_RESULTS_JSON}
- Coverage Report HTML: {COVERAGE_HTML}
- Coverage Report LCOV: {COVERAGE_LCOV}
- Screenshots: {SCREENSHOTS_DIR}
- Logs: {LOGS_DIR}
