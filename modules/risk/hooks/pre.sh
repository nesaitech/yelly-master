#!/bin/bash
# Pre-risk: ensure risk dirs exist.
mkdir -p docs/8hour/risks/archive
if [ ! -f docs/8hour/risks/active.md ]; then
  echo "# Active Risk Register" > docs/8hour/risks/active.md
fi
exit 0
