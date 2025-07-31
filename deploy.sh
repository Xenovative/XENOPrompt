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
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    root /var/www/ai-prompt-generator;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/ai-prompt-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Enable firewall
sudo ufw allow 'Nginx Full'