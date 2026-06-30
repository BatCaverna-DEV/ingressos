#!/bin/bash
# Script de deploy — sistema de ingressos
# Executar no servidor como root ou com sudo

set -e

APP_DIR="/var/www/html/ingressos"
BACK_DIR="/opt/ingressos-api"

echo "=== Build do frontend ==="
cd "$(dirname "$0")/../front"
npm install
npm run build

echo "=== Copiando frontend para $APP_DIR ==="
rm -rf "$APP_DIR"
cp -r dist "$APP_DIR"

echo "=== Deploy do backend em $BACK_DIR ==="
mkdir -p "$BACK_DIR"
cp -r ../back/. "$BACK_DIR/"
cd "$BACK_DIR"
npm install --omit=dev

echo "=== Iniciando/Reiniciando API com PM2 ==="
if pm2 list | grep -q 'ingressos-api'; then
  pm2 reload ingressos-api
else
  pm2 start ecosystem.config.cjs
  pm2 save
fi

echo "=== Reload do Apache ==="
systemctl reload apache2

echo ""
echo "Deploy concluído!"
echo "Frontend: http://seu-dominio.com.br/ingressos/"
echo "API:      http://127.0.0.1:3000"
