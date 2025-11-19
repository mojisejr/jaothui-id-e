# Notification System Test Validation Checklist

## Issue #233: Comprehensive Notification Testing

This checklist provides step-by-step validation for all notification system features.

---

## Pre-Testing Setup

### Environment Preparation
- [ ] Development server running (`npm run dev`)
- [ ] Database populated with test data
- [ ] At least 3 farms with various animals
- [ ] Mix of PENDING, OVERDUE, and COMPLETED activities
- [ ] Test user accounts (owner and staff)

### Test Data Requirements
- [ ] Farm 1: 5 animals, 10 pending activities, 3 overdue
- [ ] Farm 2: 3 animals, 0 pending activities
- [ ] Farm 3: 8 animals, mixed activity statuses
- [ ] At least one animal with 10+ pending activities (for "9+" test)
- [ ] At least one animal with 0 activities

---

## Automated Test Execution

### Run Test Suite
```bash
# Execute automated test script
./scripts/test-notifications.sh

# Or run specific test suites
npm test -- --testPathPattern=notification-system.test.tsx
npm test -- --testPathPattern=useNotifications.test.ts
npm test -- --testPathPattern=TopNavigation.test.tsx
```

### Build Validation (100% Required)
- [ ] `npm run build` - Zero errors
- [ ] `npm run lint` - Zero warnings
- [ ] `npm run type-check` - Zero type errors
- [ ] All tests pass

---

## Manual Testing - Desktop

### Chrome (Latest)

#### Global Notification Bell
- [ ] Open application at http://localhost:3000
- [ ] Log in as farm owner
- [ ] TopNavigation renders with notification bell
- [ ] Badge displays correct count (e.g., "13" for 13 pending+overdue)
- [ ] Badge color appropriate (red for overdue, primary otherwise)
- [ ] Hover shows tooltip: "รายการแจ้งเตือน (13)"
- [ ] Click bell navigates to `/animals?tab=activities&status=pending,overdue`
- [ ] Activities tab shows only PENDING and OVERDUE items
- [ ] Filter chips display: "รอดำเนินการ" and "เลยกำหนด" in active state

#### Manual Refresh
- [ ] Click refresh button (circular arrow) next to bell
- [ ] Loading spinner appears immediately
- [ ] API call visible in Network tab (200 OK)
- [ ] Loading spinner disappears after response
- [ ] Badge count updates (if changed)
- [ ] Response time < 500ms

#### Auto-Refresh on Focus
- [ ] Note current badge count
- [ ] Open new browser tab
- [ ] Wait 10 seconds
- [ ] Use another session to create 2 new pending activities
- [ ] Return to application tab (focus)
- [ ] Wait up to 5 seconds
- [ ] Badge count increases by 2
- [ ] No console errors

#### Per-Animal Bells
- [ ] Navigate to `/animals` page
- [ ] View animal list
- [ ] Animals with pending/overdue activities show bell icon
- [ ] Animals with 0 activities have no bell
- [ ] Badge counts are accurate per animal
- [ ] Animal with 10+ activities shows "9+"
- [ ] Click animal card with bell
- [ ] Detail view shows same bell with same count
- [ ] Activity list in detail matches bell count

#### Performance Check
- [ ] Open DevTools > Network tab
- [ ] Refresh page
- [ ] Notification API call < 200ms
- [ ] Open Performance tab
- [ ] Record page interaction
- [ ] Badge update < 200ms
- [ ] No long tasks > 50ms
- [ ] No layout shifts

### Firefox (Latest)
- [ ] Repeat all Chrome tests
- [ ] Verify no Firefox-specific rendering issues
- [ ] Check console for warnings
- [ ] Test keyboard navigation (Tab, Enter, Space)

### Safari (Latest)
- [ ] Repeat all Chrome tests
- [ ] Verify Safari-specific CSS compatibility
- [ ] Check Web Inspector for errors
- [ ] Test focus management

### Edge (Latest)
- [ ] Repeat all Chrome tests
- [ ] Verify Edge-specific compatibility
- [ ] No console warnings

---

## Manual Testing - Mobile

### iOS Safari (iPhone SE 375px)

#### Touch Targets
- [ ] Open DevTools mobile emulation (375px width)
- [ ] Inspect bell icon element
- [ ] Computed width ≥ 44px
- [ ] Computed height ≥ 44px
- [ ] Refresh button ≥ 44px × 44px
- [ ] Spacing between bell and refresh ≥ 8px
- [ ] Easy to tap without mis-taps

#### Responsive Layout
- [ ] TopNavigation fits in viewport
- [ ] No horizontal scroll
- [ ] Bell visible without scroll
- [ ] Badge readable at 375px width
- [ ] Filter chips wrap to new line if needed
- [ ] Safe area insets respected (notch area)

#### Portrait Mode
- [ ] Bell displays correctly
- [ ] Badge count visible
- [ ] Touch interaction smooth
- [ ] Navigation works
- [ ] Activities filter accessible

#### Landscape Mode
- [ ] Rotate to landscape
- [ ] Bell still visible
- [ ] Layout adapts correctly
- [ ] No overflow issues
- [ ] Touch targets remain adequate

### Android Chrome (Pixel 5, 393px)
- [ ] Repeat all iOS tests
- [ ] Verify Android-specific behavior
- [ ] Test back button navigation
- [ ] Check touch feedback (ripple effect)

### Tablet (iPad, 768px)
- [ ] Test at 768px width
- [ ] Bell and badge scale appropriately
- [ ] Layout uses available space
- [ ] Touch targets adequate
- [ ] Both orientations work

---

## Functional Test Cases

### Test Case 1: Page Load Flow
**Steps**:
1. [ ] Clear browser cache
2. [ ] Navigate to application
3. [ ] Log in as farm owner
4. [ ] Wait for page load

**Verify**:
- [ ] TopNavigation renders
- [ ] Notification bell shows badge count
- [ ] Badge number matches database (pending + overdue)
- [ ] No loading state visible (cache hit)
- [ ] Page load time < 3 seconds

### Test Case 2: Manual Refresh Flow
**Steps**:
1. [ ] Note current badge count: _____
2. [ ] Click refresh button
3. [ ] Observe loading indicator
4. [ ] Wait for completion

**Verify**:
- [ ] Loading indicator appears immediately
- [ ] API call made (check Network tab)
- [ ] Badge updates with new count
- [ ] Loading indicator disappears
- [ ] Response time < 500ms
- [ ] Count accuracy verified

### Test Case 3: Tab Return Flow
**Steps**:
1. [ ] Open application
2. [ ] Record badge count: _____
3. [ ] Open new tab
4. [ ] Wait 10 seconds
5. [ ] Return to app tab

**Verify**:
- [ ] Badge auto-updates within 5 seconds
- [ ] SWR refetchOnFocus triggered
- [ ] New count reflects changes
- [ ] No manual refresh needed
- [ ] Console shows refetch log

### Test Case 4: Global Bell Click Flow
**Steps**:
1. [ ] Click notification bell icon
2. [ ] Observe navigation
3. [ ] Check URL
4. [ ] View activities list

**Verify**:
- [ ] Navigate to `/animals` page
- [ ] URL: `?tab=activities&status=pending,overdue`
- [ ] Activities tab active
- [ ] Only PENDING and OVERDUE show
- [ ] Filter chips active
- [ ] Count matches bell badge

### Test Case 5: Per-Animal Bell Flow
**Steps**:
1. [ ] Navigate to `/animals`
2. [ ] View animal list
3. [ ] Identify animals with bells
4. [ ] Click animal with bell

**Verify**:
- [ ] Some animals show bells
- [ ] Some animals have no bell (0 activities)
- [ ] Badge counts accurate per animal
- [ ] Click navigates to detail
- [ ] Detail shows same bell count
- [ ] Activity list matches count

### Test Case 6: Error Handling Flow
**Steps**:
1. [ ] Open DevTools
2. [ ] Set Network to "Offline"
3. [ ] Click refresh button
4. [ ] Observe behavior
5. [ ] Restore network
6. [ ] Click refresh again

**Verify**:
- [ ] Error state displays (graceful)
- [ ] No application crash
- [ ] Refresh button remains usable
- [ ] After restore, badge updates
- [ ] User can continue using app
- [ ] Appropriate error message

---

## Performance Metrics

### Response Times
- [ ] Global badge update: _____ms (target: <200ms)
- [ ] Per-animal count: _____ms (target: <300ms)
- [ ] Manual refresh: _____ms (target: <500ms)
- [ ] Page load with badges: _____ms (no significant increase)

### Database Performance
- [ ] Check query logs
- [ ] Count notification queries: _____
- [ ] No N+1 query patterns
- [ ] Queries use proper joins
- [ ] Query time < 50ms

### Network Performance
- [ ] API response size: _____KB
- [ ] Gzip compression enabled
- [ ] Response headers correct
- [ ] Cache headers appropriate

---

## Accessibility Testing

### Screen Reader (VoiceOver/NVDA)
- [ ] Enable screen reader
- [ ] Navigate to notification bell
- [ ] Verify announcement: "Notifications, X pending"
- [ ] Badge count read aloud
- [ ] Filter chips announce state
- [ ] All elements accessible
- [ ] Focus order logical

### Keyboard Navigation
- [ ] Tab to notification bell
- [ ] Press Enter to click
- [ ] Tab through filters
- [ ] Press Space to toggle filter
- [ ] Tab to refresh button
- [ ] Press Enter to refresh
- [ ] Escape closes modals (if any)
- [ ] No keyboard traps

### Focus Indicators
- [ ] Focus ring visible on bell
- [ ] Focus ring visible on refresh
- [ ] Focus ring visible on filters
- [ ] Focus ring visible on animal cards
- [ ] Focus color meets contrast ratio
- [ ] Focus not obscured by other elements

### Color Contrast (WCAG AA)
- [ ] Run axe DevTools audit
- [ ] Badge background vs. foreground: ≥ 3:1
- [ ] Bell icon color: ≥ 3:1
- [ ] Filter chip active state: ≥ 3:1
- [ ] Text in badges: ≥ 4.5:1
- [ ] No contrast violations
- [ ] Test in light and dark modes

### ARIA Attributes
- [ ] Bell has `aria-label`
- [ ] Badge has `aria-live` region
- [ ] Filter chips have `role="button"`
- [ ] Active state announced
- [ ] Loading state announced
- [ ] Error state announced

---

## Browser DevTools Checks

### Console
- [ ] No errors in console
- [ ] No warnings in console
- [ ] SWR logs visible (if enabled)
- [ ] No TypeScript errors
- [ ] No deprecation warnings

### Network Tab
- [ ] Notification API calls succeed (200 OK)
- [ ] Response time < 200ms
- [ ] Payload size reasonable
- [ ] No failed requests
- [ ] Cache headers correct

### Performance Tab
- [ ] No long tasks (>50ms)
- [ ] No layout shifts
- [ ] Smooth animations (60fps)
- [ ] No memory leaks
- [ ] CPU usage reasonable

### Elements Tab
- [ ] CSS renders correctly
- [ ] No broken layouts
- [ ] Responsive breakpoints work
- [ ] Z-index stacking correct
- [ ] No overlapping elements

---

## Cross-Browser Compatibility

### Desktop
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] No browser-specific bugs

### Mobile
- [ ] iOS Safari: All features work
- [ ] Android Chrome: All features work
- [ ] Safari on iPad: All features work
- [ ] Chrome on Android tablet: All features work

---

## Edge Cases and Special Scenarios

### Zero Notifications
- [ ] Farm with 0 pending activities
- [ ] Badge shows "0" or hidden
- [ ] Click still navigates
- [ ] No errors

### Large Counts
- [ ] Animal with 15+ activities
- [ ] Badge shows "9+"
- [ ] Tooltip shows exact count
- [ ] Detail view shows all

### Rapid Clicking
- [ ] Click bell rapidly 5 times
- [ ] No duplicate navigation
- [ ] No race conditions
- [ ] App remains stable

### Slow Network
- [ ] Throttle to "Slow 3G"
- [ ] Loading states appear
- [ ] Graceful timeout handling
- [ ] User can retry

### Concurrent Users
- [ ] Open in 2 browser tabs
- [ ] Update activity in tab 1
- [ ] Switch to tab 2
- [ ] Badge auto-updates

---

## Bug Reporting

### Bugs Found
If any issues are discovered, document using this format:

```
Bug #1: [Title]
- Environment: [Browser, OS, Screen size]
- Severity: Critical / Major / Minor
- Steps to Reproduce: [Numbered list]
- Expected: [What should happen]
- Actual: [What actually happens]
- Screenshots: [Attach if available]
- Console Errors: [Copy/paste]
```

Total Bugs Found: _____
- Critical: _____
- Major: _____
- Minor: _____

---

## Final Validation

### Acceptance Criteria
- [ ] All automated tests pass
- [ ] All manual tests pass on desktop
- [ ] All manual tests pass on mobile
- [ ] No console errors or warnings
- [ ] Performance metrics met
- [ ] Accessibility standards met (WCAG AA)
- [ ] Cross-browser compatibility verified
- [ ] Error scenarios handled gracefully
- [ ] Touch interactions responsive
- [ ] No regressions in existing features

### Build Validation (Final Check)
```bash
npm run build    # Must be 100% PASS
npm run lint     # Must be 100% PASS
npm run type-check  # Must be 100% PASS
npm test         # All tests must pass
```

- [ ] Build: PASS
- [ ] Lint: PASS
- [ ] Type Check: PASS
- [ ] Tests: PASS

---

## Test Results Summary

**Test Date**: _______________
**Tester**: _______________
**Build Version**: _______________
**Branch**: feature/task-233-test-notification-system

### Results
- Total Tests: _____
- Passed: _____
- Failed: _____
- Bugs Found: _____

### Overall Status
- [ ] PASS - Ready for PR
- [ ] FAIL - Issues need fixing

### Notes
[Add any additional observations, recommendations, or context]

---

## Next Steps

### If All Tests Pass
1. [ ] Document test results in this file
2. [ ] Commit test documentation
3. [ ] Push feature branch
4. [ ] Use `/pr` command to create Pull Request
5. [ ] Link to issue #233 in PR description

### If Tests Fail
1. [ ] Document all failures
2. [ ] Create bug reports
3. [ ] Fix critical issues
4. [ ] Re-run affected tests
5. [ ] Repeat until all pass

---

**Document Version**: 1.0
**Related Issue**: #233
**Dependencies**: #229, #230, #231, #232
**Context**: #224
