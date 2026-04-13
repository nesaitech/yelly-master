#!/bin/bash
# Pre-risk: ensure risk dirs exist.
mkdir -p docs/yelly/risks/archive
if [ ! -f docs/yelly/risks/active.md ]; then
  echo "# Active Risk Register" > docs/yelly/risks/active.md
fi
exit 0
