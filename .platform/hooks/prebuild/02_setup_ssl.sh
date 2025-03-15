#!/bin/bash

echo "======================= SSL Certificate Setup ======================="
echo "Running as user: $(whoami)"
echo "Current directory: $(pwd)"
echo "Current folders in /etc/ssl/: $(ls -la /etc/ssl/ || echo 'Cannot access /etc/ssl/')"

# Create directory if it doesn't exist
if [ ! -d "/etc/ssl/certs" ]; then
    echo "Creating /etc/ssl/certs directory..."
    sudo mkdir -p /etc/ssl/certs/ || mkdir -p /etc/ssl/certs/
    echo "Directory created: $?"
fi

# Download the certificate with proper error handling
echo "Downloading DocumentDB certificate..."
if curl -s -o /tmp/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem; then
    echo "Certificate downloaded successfully to /tmp/global-bundle.pem"
    
    # Copy to various locations to ensure it's found
    echo "Copying certificate to system locations..."
    cp /tmp/global-bundle.pem /etc/ssl/certs/global-bundle.pem || sudo cp /tmp/global-bundle.pem /etc/ssl/certs/global-bundle.pem
    cp_result=$?
    echo "Copy to /etc/ssl/certs/ result: $cp_result"
    
    # Also place the certificate in the app directory for compatibility
    echo "Copying certificate to application directory..."
    cp /tmp/global-bundle.pem ./global-bundle.pem
    echo "Copy to current directory result: $?"
    
    if [ -d "/var/app/staging" ]; then
        cp /tmp/global-bundle.pem /var/app/staging/global-bundle.pem || sudo cp /tmp/global-bundle.pem /var/app/staging/global-bundle.pem
        echo "Copy to /var/app/staging/ result: $?"
    else
        echo "/var/app/staging directory does not exist yet"
    fi
    
    # Set proper permissions
    chmod 644 ./global-bundle.pem
    chmod 644 /etc/ssl/certs/global-bundle.pem || sudo chmod 644 /etc/ssl/certs/global-bundle.pem
    
    # Print certificate info for debugging
    echo "Certificate information:"
    openssl x509 -in /tmp/global-bundle.pem -text -noout | head -n 20
else
    echo "Failed to download SSL certificate. Please check connectivity to RDS PKI service."
    exit 1
fi

# List the files to verify they exist
echo "Verifying certificate files exist:"
ls -la /etc/ssl/certs/global-bundle.pem || echo "File not found in /etc/ssl/certs/"
ls -la ./global-bundle.pem || echo "File not found in current directory"
if [ -d "/var/app/staging" ]; then
    ls -la /var/app/staging/global-bundle.pem || echo "File not found in /var/app/staging/"
fi

echo "SSL certificate setup completed." 