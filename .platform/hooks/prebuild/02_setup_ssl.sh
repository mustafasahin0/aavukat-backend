#!/bin/bash
# Download the Amazon DocumentDB certificate bundle
echo "Downloading Amazon DocumentDB certificate bundle..."
mkdir -p /etc/ssl/certs
wget -q https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O /etc/ssl/certs/global-bundle.pem
echo "Certificate bundle downloaded successfully" 