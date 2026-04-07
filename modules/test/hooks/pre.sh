#!/bin/bash
# Pre-test: detect test framework
if [ -f "vitest.config.ts" ]; then echo "FRAMEWORK=vitest"; elif [ -f "jest.config.js" ]; then echo "FRAMEWORK=jest"; else echo "FRAMEWORK=unknown"; fi
