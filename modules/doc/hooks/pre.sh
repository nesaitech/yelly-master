#!/bin/bash
# Pre-doc: find existing docs
find . -name '*.md' -not -path './node_modules/*' 2>/dev/null | head -20 || true
