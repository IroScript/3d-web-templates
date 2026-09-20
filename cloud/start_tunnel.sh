#!/usr/bin/env bash
set -e

DIR="/home/mdkamruzzamanirak_gmail_com/3D-Game-Design-Studio"
cd "$DIR"

# 1. Kill any existing preview or 3d-tunnel process if already running
pkill -f "vite preview --host 0.0.0.0 --port 5173" || true
pkill -f "cloudflared tunnel --url http://127.0.0.1:5173" || true
sleep 1

# 2. Start Vite Preview server in background
nohup npm run preview > "$DIR/cloud/preview.log" 2>&1 &
echo $! > "$DIR/cloud/preview.pid"

# 3. Wait for port 5173 to be ready
for i in {1..15}; do
  if curl -s http://127.0.0.1:5173 > /dev/null; then
    echo "✓ Local preview server ready on http://127.0.0.1:5173"
    break
  fi
  sleep 1
done

# 4. Start Cloudflare Tunnel
rm -f "$DIR/cloud/cloudflared.log"
nohup /usr/bin/cloudflared tunnel --url http://127.0.0.1:5173 --logfile "$DIR/cloud/cloudflared.log" > /dev/null 2>&1 &
echo $! > "$DIR/cloud/cloudflared.pid"

# 5. Extract public trycloudflare.com URL
TUNNEL_URL=""
for i in {1..20}; do
  if [ -f "$DIR/cloud/cloudflared.log" ]; then
    TUNNEL_URL=$(grep -o 'https://[-a-zA-Z0-9]*\.trycloudflare\.com' "$DIR/cloud/cloudflared.log" | head -n 1 || true)
    if [ -n "$TUNNEL_URL" ]; then
      echo "$TUNNEL_URL" > "$DIR/cloud/tunnel_url.txt"
      echo "✓ Cloudflare Tunnel URL established: $TUNNEL_URL"
      break
    fi
  fi
  sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
  echo "❌ Failed to obtain Cloudflare tunnel URL."
  exit 1
fi

echo "CLOUD_URL=$TUNNEL_URL"
