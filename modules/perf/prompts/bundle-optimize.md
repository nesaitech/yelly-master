# Bundle Optimization Prompt

You are reducing the JavaScript bundle size for a web application. Follow this process.

## Step 1: Measure Current Bundle
- Run `npm run build` and note the total output size
- Use `npx webpack-bundle-analyzer dist/stats.json` or equivalent to visualize
- Identify the largest chunks and their contents

## Step 2: Find Quick Wins
- Look for large libraries that could be replaced with smaller alternatives (e.g., moment.js -> date-fns or dayjs)
- Check for duplicate packages in the bundle (different versions of the same library)
- Verify tree shaking is working: import `{ specific }` not `import *`

## Step 3: Apply Code Splitting
- Split by route: each page loads only its own code
- Use dynamic `import()` for heavy components (charts, editors, modals)
- Move rarely-used features behind lazy loading

## Step 4: Optimize Dependencies
- Check if large dependencies offer ESM builds for better tree shaking
- Use `sideEffects: false` in package.json where applicable
- Consider moving heavy processing to Web Workers

## Step 5: Verify
- Rebuild and compare bundle size before and after
- Test that lazy-loaded features still work correctly
- Check that initial page load time improved
