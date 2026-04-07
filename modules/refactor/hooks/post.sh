#!/bin/bash
# Post-refactor: verify tests still pass
npm test 2>/dev/null || echo "ERROR: tests broken after refactor"
