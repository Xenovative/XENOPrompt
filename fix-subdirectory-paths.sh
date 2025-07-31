#!/bin/bash

# Fix asset paths for subdirectory deployment
# This script updates relative paths to work in subdirectories

if [ $# -ne 2 ]; then
    echo "Usage: $0 <path-to-index.html> <subdirectory-name>"
    echo "Example: $0 /var/www/html/xenoprompt/index.html xenoprompt"
    exit 1
fi

HTML_FILE="$1"
SUBDIRECTORY="$2"

if [ ! -f "$HTML_FILE" ]; then
    echo "Error: File $HTML_FILE not found!"
    exit 1
fi

echo "Fixing asset paths for subdirectory deployment..."
echo "File: $HTML_FILE"
echo "Subdirectory: $SUBDIRECTORY"

# Create backup
sudo cp "$HTML_FILE" "$HTML_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Fix the paths using sed
sudo sed -i "
    s|href=\"styles.css\"|href=\"/$SUBDIRECTORY/styles.css\"|g
    s|src=\"assets/|src=\"/$SUBDIRECTORY/assets/|g
    s|src=\"script.js\"|src=\"/$SUBDIRECTORY/script.js\"|g
" "$HTML_FILE"

echo "✅ Asset paths fixed successfully!"
echo ""
echo "Updated paths:"
echo "  - styles.css → /$SUBDIRECTORY/styles.css"
echo "  - assets/* → /$SUBDIRECTORY/assets/*"
echo "  - script.js → /$SUBDIRECTORY/script.js"
echo ""
echo "Backup created: $HTML_FILE.backup.$(date +%Y%m%d_%H%M%S)"
