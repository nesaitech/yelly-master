#!/bin/bash
# Pre-QA: check if dev server is running
curl -sf http://localhost:3000 > /dev/null 2>&1 && echo "Dev server running" || echo "WARNING: No dev server detected"
