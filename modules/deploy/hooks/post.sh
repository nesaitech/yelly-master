#!/bin/bash
# Post-deploy: check health
curl -sf "$HEALTH_URL" > /dev/null 2>&1 && echo "Health OK" || echo "Health check failed"
