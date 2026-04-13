# Trend Analysis Prompt

You are interpreting health score trends over time to understand codebase quality trajectory.

## Step 1: Load History
Read the health history file at `.8hour-master/health-history.json`. Each entry contains:
- Timestamp
- Composite score (0-10)
- Individual dimension scores (test, lint, types, security, dead_code)

## Step 2: Calculate Trends
For the overall score and each dimension:
- Compare current score to 1 week ago, 1 month ago
- Calculate the average rate of change per week
- Identify the dimension with the steepest decline (if any)

## Step 3: Interpret the Pattern

### Improving (+0.5/week or more)
- Good engineering practices are paying off
- Identify which dimensions improved most — continue those practices
- Set a target score and estimate when it will be reached

### Stable (within +/-0.3/week)
- Acceptable steady state if score is above 7
- If score is below 7, stability means debt is not being addressed
- Look for opportunities to push into improvement

### Declining (-0.3/week or more)
- Identify which dimensions are driving the decline
- Check recent changes: large merges, new team members, deadline pressure
- Recommend specific actions to reverse the trend

### Volatile (large swings >1 point)
- Suggests inconsistent practices: CI checks bypassed, then enforced
- Recommend standardizing the quality gate in CI
- Investigate if specific team members or workflows correlate with drops

## Step 4: Report
Summarize:
- Current score and 4-week trend direction
- Top 2 dimensions driving the trend
- Recommended actions ranked by impact
- Projected score in 4 weeks if trend continues
