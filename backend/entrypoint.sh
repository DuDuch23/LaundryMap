#!/bin/sh
set -e

JWT_DIR=/var/www/html/config/jwt

if [ ! -f "$JWT_DIR/private.pem" ]; then
  echo "[entrypoint] Génération des clés JWT..."
  mkdir -p "$JWT_DIR"
  openssl genrsa -out "$JWT_DIR/private.pem" 4096 2>/dev/null
  openssl rsa -pubout -in "$JWT_DIR/private.pem" -out "$JWT_DIR/public.pem" 2>/dev/null
  chmod 600 "$JWT_DIR/private.pem"
  chown www-data:www-data "$JWT_DIR/private.pem" "$JWT_DIR/public.pem"
  echo "[entrypoint] Clés JWT générées."
fi

exec "$@"
