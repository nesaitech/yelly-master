#!/bin/bash
# Pre-changelog: get last tag
git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0"
