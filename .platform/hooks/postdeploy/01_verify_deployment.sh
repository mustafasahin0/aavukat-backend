#!/bin/bash

# Print environment information for debugging
echo "=== Environment Information ==="
echo "Current working directory: $(pwd)"
echo "Application directory: /var/app/current"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Verify that necessary directories exist
echo "=== Verifying Application Directories ==="
if [ -d "/var/app/current/node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "❌ node_modules directory is missing"
fi

if [ -d "/var/app/current/dist" ]; then
    echo "✅ dist directory exists"
else
    echo "❌ dist directory is missing"
fi

# Check for SSL certificate and copy if needed
echo "=== Checking SSL Certificate ==="
if [ ! -f "/etc/ssl/certs/global-bundle.pem" ]; then
    echo "SSL certificate not found in /etc/ssl/certs. Attempting to download..."
    sudo mkdir -p /etc/ssl/certs/
    sudo curl -s -o /etc/ssl/certs/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
    sudo chmod 644 /etc/ssl/certs/global-bundle.pem
fi

# Also copy to the current application directory for compatibility
if [ ! -f "/var/app/current/global-bundle.pem" ]; then
    echo "Copying SSL certificate to application directory..."
    sudo cp /etc/ssl/certs/global-bundle.pem /var/app/current/global-bundle.pem
    sudo chmod 644 /var/app/current/global-bundle.pem
fi

# Check if certificates exist now
echo "Verifying certificate files exist:"
ls -la /etc/ssl/certs/global-bundle.pem || echo "Certificate still missing in /etc/ssl/certs/"
ls -la /var/app/current/global-bundle.pem || echo "Certificate still missing in application directory"

# Check application health
echo "=== Checking Application Health ==="
health_check=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health || echo "failed")
if [ "$health_check" == "200" ]; then
    echo "✅ Application is responding with 200 OK on /health endpoint"
else
    echo "❌ Application health check failed with status: $health_check"
    echo "Checking if application is running on port 8080:"
    netstat -tulpn | grep 8080
fi

# Print recent logs
echo "=== Recent Application Logs ==="
tail -n 20 /var/log/web.stdout.log

echo "=== Post-deployment verification completed ===" 