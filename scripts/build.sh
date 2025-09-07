#!/bin/bash

# Exit on any error
set -e

echo "Starting build process..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Warning: DATABASE_URL is not set. Build will continue but database operations may fail."
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build Next.js application
echo "Building Next.js application..."
npm run build

echo "Build completed successfully!"
