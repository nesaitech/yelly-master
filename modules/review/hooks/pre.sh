#!/bin/bash
# Pre-review: fetch latest diff
git diff --stat HEAD~1 2>/dev/null || true
