#!/usr/bin/env bash
set -euo pipefail

PROJECT_URL="https://vxnwxglnglszowczsqsx.supabase.co"
ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bnd4Z2xuZ2xzem93Y3pzcXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjQ3NjcsImV4cCI6MjA3Njc0MDc2N30.GJa57XSEoA2UyOmz3clQPOUdtwjVvGbkxwTjgqg6kHg"
EMAIL="fernandomosp@gmail.com"
PASS="F&e130792"

TOKEN=$(curl -s -X POST "$PROJECT_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | jq -r '.access_token')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "$TOKEN"
else
    echo "Erro: Não foi possível obter o token" >&2
    exit 1
fi