#!/bin/bash
# Pre-debt: detect tracker presence (informational; library does the real detection).
if [ -d ".github" ]; then echo "tracker-hint: github"; fi
if [ -f ".gitlab-ci.yml" ]; then echo "tracker-hint: gitlab"; fi
exit 0
