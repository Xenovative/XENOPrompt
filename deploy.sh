#!/bin/bash

# Prompt for domain name
read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME

# Optional: Prompt for API key injection
echo "\nOptional: Pre-configure API keys in the deployed application"
read -p "Enter OpenAI API key (optional, press Enter to skip): " OPENAI_KEY
read -p "Enter OpenRouter API key (optional, press Enter to skip): " OPENROUTER_KEY
read -p "Enter preferred provider [auto/openai/openrouter/ollama/local/basic] (default: openrouter): " PROVIDER
PROVIDER=${PROVIDER:-openrouter}

# Update system packages
sudo apt update
sudo apt upgrade -y

# Install Nginx
sudo apt install -y nginx

# Create website directory
sudo mkdir -p /var/www/ai-prompt-generator

# Copy your files (you'll need to upload them to the server)
# This assumes you'll upload the files to the home directory
# The following command is just for reference, you'll need to upload the files first
# sudo cp -r ~/XENOPrompt/* /var/www/ai-prompt-generator/

# Inject API keys if provided
if [ ! -z "$OPENAI_KEY" ] || [ ! -z "$OPENROUTER_KEY" ]; then
    echo "Injecting API keys into index.html..."
    
    # Create a temporary sed script
    cat > /tmp/api_inject.sed <<EOF_SED
s/openaiKey: '',/openaiKey: '$OPENAI_KEY',/g
s/openrouterKey: '',/openrouterKey: '$OPENROUTER_KEY',/g
s/provider: 'auto',/provider: '$PROVIDER',/g
EOF_SED
    
    # Apply the API key injection
    sudo sed -i -f /tmp/api_inject.sed /var/www/ai-prompt-generator/index.html
    
    # Clean up
    rm /tmp/api_inject.sed
    
    echo "API keys injected successfully!"
fi

# Set proper permissions
sudo chown -R $USER:$USER /var/www/ai-prompt-generator
sudo chmod -R 755 /var/www/ai-prompt-generator

# Create Nginx server block
sudo tee /etc/nginx/sites-available/ai-prompt-generator <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    root /var/www/ai-prompt-generator;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
EOF

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Enable the site
sudo ln -sf /etc/nginx/sites-available/ai-prompt-generator /etc/nginx/sites-enabled/

# Test nginx configuration
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
else
    echo "❌ Nginx configuration error - please check the config"
    exit 1
fi

# Configure firewall (handle different systems)
if command -v ufw >/dev/null 2>&1; then
    # Ubuntu/Debian with ufw
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    echo "✅ UFW firewall rules added"
elif command -v firewall-cmd >/dev/null 2>&1; then
    # CentOS/RHEL with firewalld
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    echo "✅ Firewalld rules added"
else
    echo "⚠️  No firewall manager detected - you may need to manually open ports 80 and 443"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "Your AI Prompt Generator is now available at:"
echo "  http://$DOMAIN_NAME"
echo ""
echo "Next steps:"
echo "1. Upload your files to /var/www/ai-prompt-generator/"
echo "2. Configure your API keys using the settings modal or run ./configure-api-keys.sh"
echo "3. Consider setting up SSL with Let's Encrypt:"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $DOMAIN_NAME"
echo ""
echo "For subdirectory deployment (like /xenoprompt), you'll need to:"
echo "1. Modify the Nginx location block"
echo "2. Update the root path accordingly"
echo "3. Ensure your DNS points to this server"
echo ""