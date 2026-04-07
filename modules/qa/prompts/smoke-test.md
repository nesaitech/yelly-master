# Smoke Test Prompt

You are performing a quick smoke test on a web application to verify basic functionality. This is not exhaustive testing — it is a quick health check.

## Checklist

### 1. Page Load
- [ ] Navigate to the home page — does it load without errors?
- [ ] Check browser console for JavaScript errors
- [ ] Check Network tab for failed requests (4xx, 5xx)
- [ ] Verify the page title and meta tags are correct

### 2. Navigation
- [ ] Click each main navigation link — does it go to the right page?
- [ ] Test the back button — does it work as expected?
- [ ] Verify the active state highlights the current page

### 3. Core Feature
- [ ] Identify the primary user action (e.g., search, create, submit)
- [ ] Perform the action with valid input — does it succeed?
- [ ] Verify the result is displayed correctly

### 4. Authentication (if applicable)
- [ ] Can you log in with valid credentials?
- [ ] Does log out work?
- [ ] Are protected pages inaccessible when logged out?

### 5. Responsive
- [ ] Resize to mobile width (375px) — is the page usable?
- [ ] Check that the mobile menu works

### 6. Performance Gut Check
- [ ] Does the page feel fast (loads in under 3 seconds)?
- [ ] Are there noticeable layout shifts during load?

## Report Format
For each failing check, note:
- What failed
- Expected vs actual behavior
- Screenshot if applicable
