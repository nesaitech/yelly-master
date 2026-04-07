#!/bin/bash
# Pre-health: check previous score
cat .yelly-master/health-history.json 2>/dev/null | tail -1 || echo "No previous health data"
