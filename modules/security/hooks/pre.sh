#!/bin/bash
# Pre-security: quick secrets grep
grep -rn "API_KEY\|SECRET\|PASSWORD\|TOKEN" --include='*.ts' --include='*.js' --include='*.env' . 2>/dev/null | head -20 || true
