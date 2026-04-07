#!/bin/bash
# Pre-retro: get commit count for period
git log --oneline --since="7 days ago" 2>/dev/null | wc -l || echo "0"
