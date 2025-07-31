#!/bin/bash

# API Key Configuration Script
# Use this script to inject API keys into an existing deployment

echo "=== AI Prompt Generator - API Key Configuration ==="
echo ""

# Get the path to index.html
read -p "Enter path to index.html (default: /var/www/ai-prompt-generator/index.html): " HTML_PATH
HTML_PATH=${HTML_PATH:-/var/www/ai-prompt-generator/index.html}

# Check if file exists
if [ ! -f "$HTML_PATH" ]; then
    echo "Error: File $HTML_PATH not found!"
    exit 1
fi

# Backup the original file
sudo cp "$HTML_PATH" "$HTML_PATH.backup.$(date +%Y%m%d_%H%M%S)"
echo "Backup created: $HTML_PATH.backup.$(date +%Y%m%d_%H%M%S)"

# Get API configuration
echo ""
echo "Enter your API configuration (press Enter to skip any field):"
read -p "OpenAI API Key: " OPENAI_KEY
read -p "OpenRouter API Key: " OPENROUTER_KEY
read -p "OpenRouter Model (default: anthropic/claude-3.5-sonnet): " OPENROUTER_MODEL
OPENROUTER_MODEL=${OPENROUTER_MODEL:-anthropic/claude-3.5-sonnet}
read -p "Provider [auto/openai/openrouter/ollama/local/basic] (default: openrouter): " PROVIDER
PROVIDER=${PROVIDER:-openrouter}
read -p "Temperature (0-1, default: 0.7): " TEMPERATURE
TEMPERATURE=${TEMPERATURE:-0.7}
read -p "Max Tokens (default: 300): " MAX_TOKENS
MAX_TOKENS=${MAX_TOKENS:-300}

# Create sed script for replacements
cat > /tmp/api_config.sed <<EOF
s/openaiKey: '[^']*',/openaiKey: '$OPENAI_KEY',/g
s/openrouterKey: '[^']*',/openrouterKey: '$OPENROUTER_KEY',/g
s/openrouterModel: '[^']*',/openrouterModel: '$OPENROUTER_MODEL',/g
s/provider: '[^']*',/provider: '$PROVIDER',/g
s/temperature: [0-9.]*,/temperature: $TEMPERATURE,/g
s/maxTokens: [0-9]*,/maxTokens: $MAX_TOKENS,/g
EOF

# Apply the configuration
sudo sed -i -f /tmp/api_config.sed "$HTML_PATH"

# Clean up
rm /tmp/api_config.sed

echo ""
echo "✅ API configuration updated successfully!"
echo ""
echo "Configuration applied:"
echo "  - OpenAI Key: ${OPENAI_KEY:+***configured***}"
echo "  - OpenRouter Key: ${OPENROUTER_KEY:+***configured***}"
echo "  - OpenRouter Model: $OPENROUTER_MODEL"
echo "  - Provider: $PROVIDER"
echo "  - Temperature: $TEMPERATURE"
echo "  - Max Tokens: $MAX_TOKENS"
echo ""
echo "Your application is now pre-configured with these settings!"
