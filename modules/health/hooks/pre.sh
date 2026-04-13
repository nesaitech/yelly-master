#!/bin/bash
# Pre-health: check previous score
cat .8hour-master/health-history.json 2>/dev/null | tail -1 || echo "No previous health data"
