#!/bin/bash

# Subdirectory Deployment Script for AI Prompt Generator
# Use this when deploying to a subdirectory like /xenoprompt

echo "=== AI Prompt Generator - Subdirectory Deployment ==="
echo ""

# Get configuration
read -p "Enter your domain name (e.g., xenovative-ltd.com): " DOMAIN_NAME
read -p "Enter subdirectory path (e.g., xenoprompt): " SUBDIRECTORY
read -p "Enter full web root path (e.g., /var/www/html): " WEB_ROOT

# Optional API key configuration
echo ""
echo "Optional: Pre-configure API keys in the deployed application"
read -p "Enter OpenAI API key (optional, press Enter to skip): " OPENAI_KEY
read -p "Enter OpenRouter API key (optional, press Enter to skip): " OPENROUTER_KEY
read -p "Enter preferred provider [auto/openai/openrouter/ollama/local/basic] (default: openrouter): " PROVIDER
PROVIDER=${PROVIDER:-openrouter}

# Create subdirectory
DEPLOY_PATH="$WEB_ROOT/$SUBDIRECTORY"
sudo mkdir -p "$DEPLOY_PATH"

echo "Deployment path: $DEPLOY_PATH"

# Copy files (assumes files are in current directory)
echo "Copying files to $DEPLOY_PATH..."
sudo cp -r ./* "$DEPLOY_PATH/"

# Fix asset paths for subdirectory deployment
echo "Fixing asset paths for subdirectory deployment..."
sudo sed -i "
    s|href=\"styles.css\"|href=\"/$SUBDIRECTORY/styles.css\"|g
    s|src=\"assets/|src=\"/$SUBDIRECTORY/assets/|g
    s|src=\"script.js\"|src=\"/$SUBDIRECTORY/script.js\"|g
" "$DEPLOY_PATH/index.html"
echo "✅ Asset paths updated for subdirectory deployment"

# Inject API keys if provided
if [ ! -z "$OPENAI_KEY" ] || [ ! -z "$OPENROUTER_KEY" ]; then
    echo "Injecting API keys into index.html..."
    
    # Create a temporary sed script
    cat > /tmp/api_inject.sed <<EOF_SED
s/openaiKey: '[^']*',/openaiKey: '$OPENAI_KEY',/g
s/openrouterKey: '[^']*',/openrouterKey: '$OPENROUTER_KEY',/g
s/provider: '[^']*',/provider: '$PROVIDER',/g
EOF_SED
    
    # Apply the API key injection
    sudo sed -i -f /tmp/api_inject.sed "$DEPLOY_PATH/index.html"
    
    # Clean up
    rm /tmp/api_inject.sed
    
    echo "API keys injected successfully!"
fi

# Set proper permissions
sudo chown -R www-data:www-data "$DEPLOY_PATH"
sudo chmod -R 755 "$DEPLOY_PATH"

# Create or update Nginx configuration for subdirectory
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN_NAME"

if [ -f "$NGINX_CONFIG" ]; then
    echo "Updating existing Nginx configuration..."
    
    # Add location block for subdirectory
    sudo tee -a "$NGINX_CONFIG" <<EOF

    # AI Prompt Generator subdirectory
    location /$SUBDIRECTORY {
        alias $DEPLOY_PATH;
        index index.html;
        try_files \$uri \$uri/ =404;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
EOF
else
    echo "Creating new Nginx configuration..."
    
    sudo tee "$NGINX_CONFIG" <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    root $WEB_ROOT;
    index index.html;

    # AI Prompt Generator subdirectory
    location /$SUBDIRECTORY {
        alias $DEPLOY_PATH;
        index index.html;
        try_files \$uri \$uri/ =404;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Default location
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

    # Enable the site
    sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
fi

# Test and reload Nginx
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
else
    echo "❌ Nginx configuration error - please check the config"
    exit 1
fi

echo ""
echo "🎉 Subdirectory deployment completed successfully!"
echo ""
echo "Your AI Prompt Generator is now available at:"
echo "  http://$DOMAIN_NAME/$SUBDIRECTORY"
echo ""
echo "Files deployed to: $DEPLOY_PATH"
echo ""
echo "Next steps:"
echo "1. Test the application in your browser"
echo "2. Configure additional API keys if needed using the settings modal"
echo "3. Consider setting up SSL with Let's Encrypt:"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $DOMAIN_NAME"
echo ""
