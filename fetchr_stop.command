#!/bin/bash
# ===== Stop Fetchr Proxy Server =====

PORT=9000

# Find PID using the port
PID=$(lsof -ti tcp:$PORT)

if [ -z "$PID" ]; then
  echo "No process found running on port $PORT"
else
  echo "Stopping process on port $PORT (PID: $PID)"
  kill $PID
  echo "Fetchr proxy server stopped."
fi
