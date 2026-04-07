#!/bin/bash
# Pre-env: list .env files
find . -name '.env*' -not -path './node_modules/*' 2>/dev/null || true
