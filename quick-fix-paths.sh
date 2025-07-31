#!/bin/bash

# Quick fix for existing deployment with 404 errors
# Run this on your server to fix the asset paths

echo "=== Quick Fix for 404 Asset Errors ==="
echo ""

# Default values based on your setup
DEFAULT_PATH="/var/www/html/xenoprompt/index.html"
DEFAULT_SUBDIRECTORY="xenoprompt"

read -p "Enter path to index.html (default: $DEFAULT_PATH): " HTML_PATH
HTML_PATH=${HTML_PATH:-$DEFAULT_PATH}

read -p "Enter subdirectory name (default: $DEFAULT_SUBDIRECTORY): " SUBDIRECTORY
SUBDIRECTORY=${SUBDIRECTORY:-$DEFAULT_SUBDIRECTORY}

if [ ! -f "$HTML_PATH" ]; then
    echo "❌ Error: File $HTML_PATH not found!"
    echo "Please check the path and try again."
    exit 1
fi

echo ""
echo "Fixing asset paths in: $HTML_PATH"
echo "Subdirectory: $SUBDIRECTORY"
echo ""

# Create backup
sudo cp "$HTML_PATH" "$HTML_PATH.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"

# Fix the paths
sudo sed -i "
    s|href=\"styles.css\"|href=\"/$SUBDIRECTORY/styles.css\"|g
    s|src=\"assets/xenovative.png\"|src=\"/$SUBDIRECTORY/assets/xenovative.png\"|g
    s|src=\"script.js\"|src=\"/$SUBDIRECTORY/script.js\"|g
" "$HTML_PATH"

echo "✅ Asset paths fixed!"
echo ""
echo "Updated paths:"
echo "  - styles.css → /$SUBDIRECTORY/styles.css"
echo "  - assets/xenovative.png → /$SUBDIRECTORY/assets/xenovative.png"
echo "  - script.js → /$SUBDIRECTORY/script.js"
echo ""
echo "🎉 Your application should now load correctly!"
echo "Try refreshing your browser: http://your-domain.com/$SUBDIRECTORY"
