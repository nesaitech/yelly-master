# Browser-Based QA Testing

A structured approach to verifying that a web application works correctly from the user's perspective. QA testing catches issues that unit and integration tests miss: visual bugs, broken flows, accessibility failures, and cross-browser inconsistencies.

## Workflow

1. **Verify the environment.** Confirm the dev server is running and accessible. Check the target URL responds with a 200 status. Note the environment (local, staging, production) and any relevant configuration.

2. **Check the page loads correctly.** Navigate to the target URL. Verify the page renders without blank screens or layout shifts. Open the browser console and check for JavaScript errors, failed network requests, and deprecation warnings.

3. **Test core user flows.** Walk through the primary user journeys: sign up, log in, create/read/update/delete operations, checkout, search. For each flow, verify that the happy path works end-to-end and that error states are handled gracefully.

4. **Test form interactions.** For every form: submit with valid data, submit with empty required fields, submit with invalid data (wrong email format, too-short password). Verify error messages appear next to the correct fields. Test paste, autofill, and keyboard-only submission.

5. **Test responsive layouts.** Resize the browser to common breakpoints: 320px (mobile), 768px (tablet), 1024px (small desktop), 1440px (large desktop). Check for horizontal overflow, overlapping elements, unreadable text, and broken navigation menus.

6. **Run accessibility checks.** Verify keyboard navigation works (Tab, Enter, Escape). Check that all interactive elements have visible focus indicators. Verify images have alt text. Test with a screen reader if possible. Check color contrast ratios meet WCAG AA (4.5:1 for text).

7. **Take screenshots for evidence.** Capture screenshots of bugs, broken layouts, and error states. Annotate with the browser viewport size, steps to reproduce, and expected vs actual behavior.

8. **Compare against baseline.** If visual regression baselines exist, compare current screenshots against them. Flag any unintended visual changes.

9. **Report findings.** For each bug, document: summary, severity, steps to reproduce, expected behavior, actual behavior, screenshot, browser and viewport size. Prioritize by user impact.

10. **Verify fixes.** After bugs are fixed, re-test the specific scenarios to confirm the fix works and did not introduce new issues.
