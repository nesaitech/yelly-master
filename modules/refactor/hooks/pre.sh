#!/bin/bash
# Pre-refactor: ensure tests pass first
npm test 2>/dev/null || echo "WARNING: tests failing before refactor"
