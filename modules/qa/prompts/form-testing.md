# Form Testing Prompt

You are comprehensively testing a web form. Cover all input types, validation, submission, and edge cases.

## Step 1: Identify All Fields
- List every input field, its type, and whether it is required
- Note any conditional fields (shown/hidden based on other selections)
- Identify the submit button and any secondary actions (cancel, reset)

## Step 2: Happy Path
- Fill all fields with valid data
- Submit the form
- Verify success feedback (redirect, toast, confirmation message)
- Verify data was actually saved (check the destination page/API)

## Step 3: Validation Testing
For each required field:
- Leave it empty and submit — verify error message appears
- Verify error message is next to the correct field
- Verify error clears when the field is filled correctly

For each field with format requirements:
- Enter invalid format (e.g., "notanemail" for email field)
- Enter boundary values (min length, max length, min/max number)
- Enter special characters and verify they are handled

## Step 4: Edge Cases
- Submit the form twice rapidly (double-submit protection)
- Submit with JavaScript disabled (does server-side validation catch it?)
- Fill the form, navigate away, come back (is data preserved?)
- Test paste into each field
- Test browser autofill

## Step 5: Accessibility
- Can you complete the form using only keyboard?
- Are error messages announced to screen readers?
- Do labels correctly associate with inputs (clicking label focuses input)?
- Is the tab order logical?

## Step 6: Report
For each issue found:
- Field name and type
- Input that triggered the issue
- Expected behavior
- Actual behavior
- Severity (blocks submission, confusing UX, cosmetic)
