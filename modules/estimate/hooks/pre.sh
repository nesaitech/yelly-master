#!/bin/bash
# Pre-estimate: ensure the history dir exists and show calibration data point count.
mkdir -p .yelly/history
if [ -f .yelly/history/estimates.jsonl ]; then
  count=$(wc -l < .yelly/history/estimates.jsonl)
  echo "calibration: $count past estimate(s) on file"
else
  echo "calibration: no history yet"
fi
exit 0
