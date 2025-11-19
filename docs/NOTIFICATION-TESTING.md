# Notification System Testing Documentation

## Overview

This document provides comprehensive testing procedures for the Jaothui ID-Trace notification system, covering global and per-animal notifications across desktop and mobile platforms.

**Related Issues**:
- #229 - useNotifications hook implementation
- #230 - TopNavigation integration
- #231 - Per-animal notifications
- #232 - ActivityFilters enhancement
- #233 - Comprehensive testing (this task)

**Context**: #224 - Notification System Implementation

---

## Testing Environments

### Desktop Browsers
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- Screen resolution: 1920x1080

### Mobile Devices
- ✅ iOS Safari (14+)
- ✅ Android Chrome
- Screen sizes: 375px, 425px, 768px
- Both portrait and landscape orientations

### DevTools Testing
- Chrome DevTools mobile emulation
- Firefox Responsive Design Mode
- Safari Responsive Design Mode

---

## Test Cases

### 1. Global Notification Bell (TopNavigation)

#### Test 1.1: Page Load Badge Display
**Objective**: Verify badge displays correct count on initial page load

**Steps**:
1. Open browser and navigate to application
2. Log in as farm owner or staff member
3. Wait for TopNavigation to render
4. Observe notification bell badge

**Expected Result**:
- Badge displays total count of pending + overdue activities
- Count matches database query result
- No loading state visible if cache hit
- Badge color indicates urgency (red for overdue)

**Acceptance Criteria**:
- ✅ Badge count is accurate
- ✅ Badge renders in < 200ms
- ✅ No console errors

---

#### Test 1.2: Manual Refresh
**Objective**: Verify manual refresh updates badge count

**Steps**:
1. Note current badge count
2. Click refresh button (circular arrow icon)
3. Observe loading indicator
4. Wait for refresh to complete
5. Compare new badge count

**Expected Result**:
- Loading indicator appears immediately
- API call fetches fresh data
- Badge updates with new count
- Loading indicator disappears
- Response time < 500ms

**Acceptance Criteria**:
- ✅ Refresh button triggers API call
- ✅ Loading state visible during fetch
- ✅ Badge updates correctly
- ✅ No errors in console

---

#### Test 1.3: Auto-Refresh on Window Focus
**Objective**: Verify SWR auto-refetch when returning to tab

**Steps**:
1. Open application in browser tab
2. Record initial badge count
3. Open new tab and wait 10 seconds
4. Create/update activity in database (via another session)
5. Return to application tab
6. Observe badge count

**Expected Result**:
- Badge auto-updates within 5 seconds of focus
- SWR refetchOnFocus triggers API call
- New count reflects database changes
- No manual refresh needed

**Acceptance Criteria**:
- ✅ Auto-refetch on focus works
- ✅ Badge updates within 5 seconds
- ✅ Count is accurate
- ✅ No duplicate API calls

---

#### Test 1.4: Bell Click Navigation
**Objective**: Verify clicking bell navigates to filtered activities

**Steps**:
1. Click notification bell icon
2. Observe navigation
3. Check URL parameters
4. Verify activities list

**Expected Result**:
- Navigate to `/animals` page
- URL: `?tab=activities&status=pending,overdue`
- Activities tab is active
- Only PENDING and OVERDUE activities show
- Filter chips show active state

**Acceptance Criteria**:
- ✅ Navigation works correctly
- ✅ URL parameters correct
- ✅ Filters applied correctly
- ✅ Tab state synchronized

---

#### Test 1.5: Error Handling
**Objective**: Verify graceful error handling

**Steps**:
1. Use DevTools to throttle network to offline
2. Click refresh button
3. Observe error state
4. Restore network connection
5. Click refresh again

**Expected Result**:
- Error state displays (fallback badge or message)
- No application crash
- Refresh button remains functional
- After network restore, badge updates correctly

**Acceptance Criteria**:
- ✅ Error state visible
- ✅ No console errors beyond network failure
- ✅ Recovery works after retry
- ✅ User can continue using app

---

### 2. Per-Animal Notification Bells (AnimalCard)

#### Test 2.1: Bell Visibility Conditions
**Objective**: Verify bells show only for animals with due/overdue activities

**Steps**:
1. Navigate to `/animals` page
2. View animal list
3. Identify animals with/without bells
4. Compare with activity database

**Expected Result**:
- Animals with pending/overdue activities show bell
- Animals with 0 pending activities have no bell
- Bell badge shows accurate count per animal
- Multiple animals display correctly

**Acceptance Criteria**:
- ✅ Conditional rendering works
- ✅ Counts accurate per animal
- ✅ No bells for inactive animals
- ✅ Visual consistency across list

---

#### Test 2.2: Per-Animal Count Accuracy
**Objective**: Verify each animal shows correct notification count

**Steps**:
1. Select animal with known activity count
2. Observe bell badge number
3. Click animal to view details
4. Count activities in detail view
5. Compare counts

**Expected Result**:
- Badge count matches actual pending + overdue activities
- Detail view shows same count
- Activity list shows all counted items
- Large counts (10+) display as "9+"

**Acceptance Criteria**:
- ✅ Count accuracy 100%
- ✅ Badge overflow handled
- ✅ Detail view consistent
- ✅ No counting errors

---

#### Test 2.3: Animal List and Detail Views
**Objective**: Verify bells render in both list and detail views

**Steps**:
1. View animals list page
2. Observe bells on cards
3. Click animal with bell
4. View detail page
5. Observe bell in detail view

**Expected Result**:
- List view: Bell shows in card header
- Detail view: Bell shows in animal info section
- Both views show same count
- Click behavior consistent

**Acceptance Criteria**:
- ✅ List view rendering correct
- ✅ Detail view rendering correct
- ✅ Count consistency maintained
- ✅ UI positioning appropriate

---

### 3. Activity Filtering

#### Test 3.1: Filter Application
**Objective**: Verify activity filters work correctly

**Steps**:
1. Navigate to activities tab
2. Click notification bell (or use filters)
3. Observe filtered activities
4. Check filter chips state
5. Verify URL parameters

**Expected Result**:
- Only PENDING and OVERDUE activities show
- Filter chips highlight active filters
- URL: `?status=pending,overdue`
- Count matches filtered results

**Acceptance Criteria**:
- ✅ Filter logic correct
- ✅ URL parameters accurate
- ✅ Chip state synchronized
- ✅ No filtering errors

---

#### Test 3.2: Filter Toggle and Clear
**Objective**: Verify filter interactions work

**Steps**:
1. Apply filters (pending, overdue)
2. Click filter chip to toggle off
3. Observe activity list changes
4. Click "Clear filters" button
5. Verify all activities show

**Expected Result**:
- Toggle removes individual filter
- List updates immediately
- Clear button removes all filters
- URL parameters update
- All activities visible after clear

**Acceptance Criteria**:
- ✅ Toggle works correctly
- ✅ Clear removes all filters
- ✅ UI updates immediately
- ✅ No state issues

---

### 4. Mobile Experience

#### Test 4.1: Touch Target Sizes
**Objective**: Verify touch targets meet 44px minimum

**Steps**:
1. Open DevTools mobile emulation (375px width)
2. Inspect bell icon element
3. Measure computed width and height
4. Test refresh button size

**Expected Result**:
- Bell icon: ≥ 44px × 44px
- Refresh button: ≥ 44px × 44px
- Adequate spacing between elements
- Easy to tap without mis-taps

**Acceptance Criteria**:
- ✅ All touch targets ≥ 44px
- ✅ No overlapping targets
- ✅ Spacing adequate (≥ 8px)
- ✅ Touch interaction smooth

---

#### Test 4.2: Mobile Layout and Responsiveness
**Objective**: Verify mobile layout works correctly

**Steps**:
1. Test at 375px width (iPhone SE)
2. Test at 425px width (larger phones)
3. Test at 768px width (tablets)
4. Rotate to landscape orientation
5. Observe all views

**Expected Result**:
- Bells visible without horizontal scroll
- Filter chips wrap correctly
- Safe area padding respected (iOS)
- Navigation accessible
- No layout breaks

**Acceptance Criteria**:
- ✅ Responsive at all breakpoints
- ✅ No horizontal scroll
- ✅ Safe areas respected
- ✅ Portrait and landscape work

---

### 5. Performance Metrics

#### Test 5.1: Badge Update Performance
**Objective**: Measure badge update times

**Steps**:
1. Open DevTools Performance tab
2. Start recording
3. Click refresh button
4. Stop recording after badge updates
5. Analyze timeline

**Expected Result**:
- Global badge update: < 200ms
- Per-animal count: < 300ms
- Manual refresh: < 500ms
- No blocking operations

**Acceptance Criteria**:
- ✅ All metrics under targets
- ✅ No long tasks (>50ms)
- ✅ Smooth animations
- ✅ No jank

---

#### Test 5.2: Database Query Performance
**Objective**: Verify no N+1 queries

**Steps**:
1. Enable database query logging
2. Load animals list page
3. Review query logs
4. Count notification-related queries

**Expected Result**:
- Single query for global count
- Efficient join for per-animal counts
- No repeated queries per animal
- Total queries < 5 for full page load

**Acceptance Criteria**:
- ✅ No N+1 patterns
- ✅ Efficient joins used
- ✅ Query time < 50ms
- ✅ Proper indexing

---

### 6. Accessibility

#### Test 6.1: Screen Reader Support
**Objective**: Verify screen reader compatibility

**Steps**:
1. Enable screen reader (VoiceOver/NVDA)
2. Navigate to notification bell
3. Listen to announcement
4. Tab through interactive elements
5. Test filter chips

**Expected Result**:
- Bell announces: "Notifications, 5 pending"
- Badge count read aloud
- Filter chips announce state
- All interactive elements accessible
- Proper focus management

**Acceptance Criteria**:
- ✅ ARIA labels present
- ✅ Announcements clear
- ✅ Focus order logical
- ✅ State changes announced

---

#### Test 6.2: Keyboard Navigation
**Objective**: Verify keyboard accessibility

**Steps**:
1. Use Tab key to navigate
2. Press Enter/Space on bell
3. Tab through filters
4. Use arrow keys if applicable
5. Test Escape key behavior

**Expected Result**:
- Tab order logical
- Enter/Space activate elements
- Focus indicators visible
- No keyboard traps
- Escape closes modals

**Acceptance Criteria**:
- ✅ Full keyboard access
- ✅ Visible focus indicators
- ✅ Logical tab order
- ✅ No accessibility barriers

---

#### Test 6.3: Color Contrast
**Objective**: Verify WCAG AA compliance

**Steps**:
1. Use axe DevTools or Lighthouse
2. Run accessibility audit
3. Check badge color contrast
4. Verify filter chip contrast
5. Test in dark mode (if applicable)

**Expected Result**:
- Badge: ≥ 3:1 contrast (UI component)
- Text: ≥ 4.5:1 contrast (normal text)
- Large text: ≥ 3:1 contrast
- No contrast violations
- All states meet standards

**Acceptance Criteria**:
- ✅ WCAG AA compliant
- ✅ No contrast violations
- ✅ Dark mode compliant
- ✅ Color not sole indicator

---

## Test Execution Checklist

### Phase 1: Desktop Testing
- [ ] Chrome: All tests pass
- [ ] Firefox: All tests pass
- [ ] Safari: All tests pass
- [ ] Edge: All tests pass
- [ ] No console errors
- [ ] Performance metrics met

### Phase 2: Mobile Testing
- [ ] iOS Safari: All tests pass
- [ ] Android Chrome: All tests pass
- [ ] Touch targets validated
- [ ] Responsive layout works
- [ ] Landscape orientation OK
- [ ] Safe areas respected

### Phase 3: Integration Testing
- [ ] End-to-end user flows work
- [ ] Multi-tab behavior correct
- [ ] Error recovery successful
- [ ] Cross-browser consistency
- [ ] No regressions found

### Phase 4: Accessibility Testing
- [ ] Screen reader compatible
- [ ] Keyboard navigation works
- [ ] Color contrast compliant
- [ ] ARIA attributes present
- [ ] Focus management correct

### Phase 5: Performance Testing
- [ ] Badge updates < 200ms
- [ ] Per-animal counts < 300ms
- [ ] Manual refresh < 500ms
- [ ] No N+1 queries
- [ ] No memory leaks

---

## Bug Reporting Template

When issues are found during testing, use this format:

```markdown
### Bug: [Short Description]

**Environment**:
- Browser: Chrome 120.0.6099.109
- OS: macOS 14.1
- Screen: 1920x1080 (desktop) or 375px (mobile)
- Mode: Desktop / Mobile / Tablet

**Steps to Reproduce**:
1. Navigate to...
2. Click on...
3. Observe...

**Expected Behavior**:
Badge should display count of 5

**Actual Behavior**:
Badge shows 0 despite having 5 pending activities

**Screenshots/Videos**:
[Attach if available]

**Console Errors**:
```
TypeError: Cannot read property 'count' of undefined
```

**Additional Context**:
- Occurred after manual refresh
- Network request succeeded (200 OK)
- Data in response but not rendering
```

---

## Testing Tools

### Required Tools
- Chrome DevTools
- Firefox Developer Tools
- Safari Web Inspector
- axe DevTools (accessibility)
- Lighthouse (performance & accessibility)

### Optional Tools
- BrowserStack (cross-browser testing)
- Network throttling tools
- Screen readers (VoiceOver, NVDA)
- Performance monitoring

---

## Success Criteria

### All Tests Must Pass
- ✅ Desktop: Chrome, Firefox, Safari, Edge
- ✅ Mobile: iOS Safari, Android Chrome
- ✅ Accessibility: WCAG AA compliant
- ✅ Performance: All metrics under targets
- ✅ Integration: Complete user flows work
- ✅ No regressions: Existing features unaffected

### Build Validation (100% Required)
- ✅ `npm run build` - Zero errors
- ✅ `npm run lint` - Zero warnings
- ✅ `npm run type-check` - Zero type errors
- ✅ `npm test` - All tests pass

### Documentation
- ✅ Test results documented
- ✅ Bugs reported properly
- ✅ Edge cases identified
- ✅ Performance metrics recorded

---

## Test Results Summary

**Test Date**: [To be filled]
**Tester**: [To be filled]
**Build Version**: [To be filled]

### Desktop Results
- [ ] Chrome: PASS / FAIL
- [ ] Firefox: PASS / FAIL
- [ ] Safari: PASS / FAIL
- [ ] Edge: PASS / FAIL

### Mobile Results
- [ ] iOS Safari: PASS / FAIL
- [ ] Android Chrome: PASS / FAIL

### Performance
- [ ] Global badge update: ___ms (target: <200ms)
- [ ] Per-animal count: ___ms (target: <300ms)
- [ ] Manual refresh: ___ms (target: <500ms)

### Accessibility
- [ ] Screen reader: PASS / FAIL
- [ ] Keyboard navigation: PASS / FAIL
- [ ] Color contrast: PASS / FAIL

### Bugs Found
- [ ] Total bugs: ___
- [ ] Critical: ___
- [ ] Major: ___
- [ ] Minor: ___

---

**Document Version**: 1.0
**Last Updated**: November 19, 2025
**Related Issue**: #233
