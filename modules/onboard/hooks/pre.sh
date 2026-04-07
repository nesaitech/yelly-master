#!/bin/bash
# Pre-onboard: count files by type
find . -name '*.ts' -o -name '*.js' -o -name '*.py' -o -name '*.go' 2>/dev/null | grep -v node_modules | wc -l || echo "0"
