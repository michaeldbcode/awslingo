#!/bin/bash

# Check if index.html exists
if [ ! -f "out/index.html" ]; then
    echo "Error: index.html not found in out directory!"
    exit 1
fi

# Get the bucket name from Terraform output
BUCKET_NAME=$(cd terraform && terraform output -raw website_bucket_name)

# Upload to S3
echo "Uploading to S3..."
aws s3 sync out/ s3://$BUCKET_NAME

# Verify index.html was uploaded
aws s3 ls s3://$BUCKET_NAME/index.html
if [ $? -ne 0 ]; then
    echo "Error: index.html not found in S3 bucket after upload!"
    exit 1
fi

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id E2J2M0GL066NYH --paths "/*"

echo "Deployment complete! Your site is available at:"
echo "https://d3vhln997vukvf.cloudfront.net"

# Wait for cache invalidation
echo "Waiting for cache invalidation to complete..."
sleep 30