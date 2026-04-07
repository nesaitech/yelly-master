#!/bin/bash
# Pre-perf: capture current bundle size
npm run build 2>/dev/null && du -sh dist/ 2>/dev/null || true
