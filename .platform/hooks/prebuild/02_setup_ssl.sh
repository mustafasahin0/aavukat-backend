#!/bin/bash

# Create directory if it doesn't exist
sudo mkdir -p /etc/ssl/certs/

# Download the certificate with proper error handling
echo "Downloading DocumentDB certificate..."
if sudo curl -s -o /etc/ssl/certs/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem; then
    echo "Certificate downloaded successfully to /etc/ssl/certs/global-bundle.pem"
    
    # Also place the certificate in the app root directory for compatibility
    echo "Copying certificate to application directory..."
    sudo cp /etc/ssl/certs/global-bundle.pem /var/app/staging/global-bundle.pem
    
    # Set proper permissions
    sudo chmod 644 /etc/ssl/certs/global-bundle.pem
    sudo chmod 644 /var/app/staging/global-bundle.pem
    
    # Print certificate info for debugging
    echo "Certificate information:"
    openssl x509 -in /etc/ssl/certs/global-bundle.pem -text -noout | head -n 20
else
    echo "Failed to download SSL certificate. Please check connectivity to RDS PKI service."
    exit 1
fi

# List the files to verify they exist
echo "Verifying certificate files exist:"
ls -la /etc/ssl/certs/global-bundle.pem
ls -la /var/app/staging/global-bundle.pem

echo "SSL certificate setup completed." 