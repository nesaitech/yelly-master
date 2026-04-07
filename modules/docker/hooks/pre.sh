#!/bin/bash
# Pre-docker: check Docker is running
docker info > /dev/null 2>&1 || echo "WARNING: Docker not running"
