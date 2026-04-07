#!/bin/bash
# Pre-lint: detect linter
if [ -f "biome.json" ]; then echo "LINTER=biome"; elif [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || [ -f "eslint.config.js" ]; then echo "LINTER=eslint"; else echo "LINTER=unknown"; fi
