#!/bin/bash
# Post-estimate: warn if the latest estimate file is missing the closure section.
latest=$(ls -t docs/8hour/estimates/*.md 2>/dev/null | head -1)
if [ -z "$latest" ]; then
  exit 0
fi
if ! grep -q "## Closure" "$latest"; then
  echo "WARN: $latest missing Closure section" >&2
fi
exit 0
