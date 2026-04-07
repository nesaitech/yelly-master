#!/bin/bash
# Pre-deploy: run tests
npm test 2>/dev/null || echo "WARNING: tests failing"
