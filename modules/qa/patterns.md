# QA Testing Patterns

## Form Testing

### Form Validation Testing
- Submit with all fields empty — verify required field errors appear
- Submit with each required field missing individually
- Enter invalid formats (email without @, phone with letters)
- Test maximum length limits and boundary values
- Verify error messages are specific and helpful, not generic
- Test that errors clear when the user corrects the input

### Input Edge Cases
- Paste content into fields (may bypass character-by-character validation)
- Test browser autofill behavior
- Enter Unicode characters, emoji, and special characters
- Test very long input strings
- Test with leading/trailing whitespace

## Responsive Testing

### Breakpoint Testing
- **320px**: Smallest mobile (iPhone SE) — check nothing overflows horizontally
- **375px**: Standard mobile (iPhone) — verify touch targets are at least 44x44px
- **768px**: Tablet — check navigation and sidebar behavior
- **1024px**: Small desktop — verify layout transitions
- **1440px**: Large desktop — check content does not stretch too wide

### Common Responsive Issues
- Horizontal scroll on mobile (usually caused by fixed-width elements)
- Text too small to read without zooming
- Overlapping elements at certain widths
- Navigation menu broken or inaccessible on mobile
- Images overflowing their containers

## Accessibility Checks

### Keyboard Navigation
- Tab through the entire page — verify logical focus order
- All interactive elements reachable via keyboard
- Focus indicators visible on every focusable element
- Escape key closes modals and dropdowns
- Enter/Space activate buttons and links

### ARIA and Semantics
- Images have descriptive alt text (not "image" or empty on meaningful images)
- Form inputs have associated labels
- Headings follow hierarchical order (h1 > h2 > h3)
- ARIA roles used correctly (not overriding semantic HTML)
- Live regions announce dynamic content changes

## Visual Regression

### Visual Regression Detection
- Compare screenshots against known-good baselines
- Focus on layout shifts, font changes, color differences
- Check that intentional changes are reflected in updated baselines
- Pay attention to hover states, active states, and transitions

## Cross-Browser

### Cross-Browser Compatibility
- Test in Chrome, Firefox, and Safari at minimum
- Check CSS features against caniuse.com
- Verify JavaScript APIs are supported or polyfilled
- Test in both light and dark mode if supported

## Loading States

### Loading State Verification
- Verify loading indicators appear during data fetches
- Check that skeleton screens or spinners render correctly
- Test slow network conditions (throttle to 3G)
- Verify error states appear on network failure
- Confirm loading states resolve and content appears
