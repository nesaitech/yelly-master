#!/bin/bash
# Pre-CI: check for workflow files
ls .github/workflows/ 2>/dev/null || ls .gitlab-ci.yml 2>/dev/null || true
