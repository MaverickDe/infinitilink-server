#!/usr/bin/env bash
DOMAIN="localhost:5002"
BASE_URL="$DOMAIN/api/releases"





set -e

BIN_NAME="xavren"
INSTALL_DIR="/usr/local/bin"
DOMAIN="${DOMAIN:-https://yourdomain.com}"  # fallback to production
BASE_URL="$DOMAIN/api/releases"

# Detect OS and architecture
OS=$(uname -s)
ARCH=$(uname -m)

# Normalize architecture names
case "$ARCH" in
  x86_64) ARCH="x86_64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) echo "❌ Unsupported architecture: $ARCH"; exit 1 ;;
esac

# Detect OS
case "$OS" in
  Linux*)   FILE="linux-${ARCH}" ;;
  Darwin*)  FILE="macos-${ARCH}" ;;
  *)        echo "❌ Unsupported OS: $OS"; exit 1 ;;
esac

URL="$BASE_URL/$FILE"

echo "🌍 Downloading $BIN_NAME for $OS/$ARCH..."
TMP_FILE="$(mktemp)"
if ! curl -fsSL "$URL" -o "$TMP_FILE"; then
  echo "❌ Failed to download from $URL"
  exit 1
fi

echo "🔑 Setting permissions..."
chmod +x "$TMP_FILE"

echo "📦 Installing to $INSTALL_DIR..."
sudo mv "$TMP_FILE" "$INSTALL_DIR/$BIN_NAME"

echo "✅ Installed $BIN_NAME successfully!"
echo "Run '$BIN_NAME --help' to get started."

