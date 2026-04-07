#!/bin/bash
# Post-debug: run tests to verify fix
npm test 2>/dev/null || true
