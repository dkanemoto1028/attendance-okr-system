#!/bin/bash
# PeopleOS — 一発起動スクリプト
echo "🚀 PeopleOS を起動します..."

# Backend
echo "📦 バックエンド起動中 (port 4000)..."
cd "$(dirname "$0")/backend" && npm run dev &
BACKEND_PID=$!

sleep 3

# Frontend
echo "🌐 フロントエンド起動中 (port 3000)..."
cd "$(dirname "$0")" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 起動完了！"
echo "  フロントエンド: http://localhost:3000"
echo "  バックエンドAPI: http://localhost:4000"
echo "  ヘルスチェック: http://localhost:4000/health"
echo ""
echo "停止: Ctrl+C"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
