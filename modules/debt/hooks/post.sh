#!/bin/bash
# Post-debt: warn if the local register has grown beyond a sane size.
if [ -f "docs/8hour/debt/register.md" ]; then
  lines=$(wc -l < "docs/8hour/debt/register.md")
  if [ "$lines" -gt 800 ]; then
    echo "WARN: docs/8hour/debt/register.md has $lines lines — consider closing some items" >&2
  fi
fi
exit 0
