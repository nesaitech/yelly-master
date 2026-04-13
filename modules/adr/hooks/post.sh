#!/bin/bash
# Post-adr: validate the latest ADR has all required Nygard sections.
latest=$(ls -t docs/yelly/adr/*.md 2>/dev/null | head -1)
if [ -z "$latest" ]; then
  exit 0
fi
for section in "## Status" "## Context" "## Decision" "## Consequences" "## Alternatives Considered"; do
  if ! grep -q "^$section" "$latest"; then
    echo "WARN: $latest missing section: $section" >&2
  fi
done
exit 0
