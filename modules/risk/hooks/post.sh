#!/bin/bash
# Post-risk: count active risks, warn if any are ownerless.
if [ ! -f docs/yelly/risks/active.md ]; then
  exit 0
fi
total=$(grep -c '^## ' docs/yelly/risks/active.md || true)
ownerless=$(grep -c 'Owner: $\|owner: $\|Owner: TBD' docs/yelly/risks/active.md || true)
echo "risk register: $total active"
if [ "$ownerless" -gt 0 ]; then
  echo "WARN: $ownerless ownerless risk(s) — assign within 48h" >&2
fi
exit 0
