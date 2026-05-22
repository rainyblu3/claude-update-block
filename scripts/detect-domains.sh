#!/bin/bash
# Monitor Claude Desktop network connections to detect update-check domains.
# Usage: bash scripts/detect-domains.sh [duration_seconds]

DURATION=${1:-60}
echo "Monitoring Claude network connections for ${DURATION}s..."
echo "Look for update-related domains in the output below."
echo "Press Ctrl+C to stop early."
echo ""

# Filter for Claude process connections
sudo lsof -i -P -n 2>/dev/null | grep -i claude | grep -i ESTABLISHED
