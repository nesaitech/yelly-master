#!/bin/bash
# Post-debt: warn if the local register has grown beyond a sane size.
if [ -f "docs/yelly/debt/register.md" ]; then
  lines=$(wc -l < "docs/yelly/debt/register.md")
  if [ "$lines" -gt 800 ]; then
    echo "WARN: docs/yelly/debt/register.md has $lines lines — consider closing some items" >&2
  fi
fi
exit 0
