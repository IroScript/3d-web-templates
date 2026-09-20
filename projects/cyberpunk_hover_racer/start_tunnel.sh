#!/usr/bin/env bash
set -e

PROJECT_DIR="/home/mdkamruzzamanirak_gmail_com/3D-Game-Design-Studio/projects/cyberpunk_hover_racer"
PORT=5175
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"

# 1. Kill any existing server / tunnel on port 5175
pkill -f "http.server $PORT" || true
pkill -f "cloudflared tunnel --url http://127.0.0.1:$PORT" || true
sleep 1

# 2. Start HTTP server with setsid
setsid python3 -m http.server $PORT --directory "$PROJECT_DIR" > "$LOG_DIR/http_server.log" 2>&1 &

# 3. Wait for server to respond
for i in {1..10}; do
  if curl -s "http://127.0.0.1:$PORT" > /dev/null; then
    echo "✓ Local HTTP server ready on port $PORT"
    break
  fi
  sleep 1
done

# 4. Start Cloudflare Tunnel with setsid
rm -f "$LOG_DIR/cloudflared.log"
setsid /usr/bin/cloudflared tunnel --url "http://127.0.0.1:$PORT" --logfile "$LOG_DIR/cloudflared.log" > /dev/null 2>&1 &

# 5. Extract Cloudflare URL
TUNNEL_URL=""
for i in {1..25}; do
  if [ -f "$LOG_DIR/cloudflared.log" ]; then
    TUNNEL_URL=$(grep -o 'https://[-a-zA-Z0-9]*\.trycloudflare\.com' "$LOG_DIR/cloudflared.log" | head -n 1 || true)
    if [ -n "$TUNNEL_URL" ]; then
      echo "$TUNNEL_URL" > "$LOG_DIR/tunnel_url.txt"
      echo "✓ Cloudflare Tunnel URL established: $TUNNEL_URL"
      break
    fi
  fi
  sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
  echo "❌ Cloudflare tunnel URL could not be established."
  exit 1
fi

echo "RACER_3D_URL=$TUNNEL_URL"
