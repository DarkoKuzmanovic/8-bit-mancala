#!/bin/bash

# Production Server Update Script
# This script automates the process of updating the production server.

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# Use current directory dynamically instead of hardcoded path
APP_DIR="$(pwd)"
# Create dynamic log file based on directory name to avoid conflicts
DIR_NAME=$(basename "$APP_DIR")
LOG_FILE="/tmp/8-bit-mancala-${DIR_NAME}.log"
HEALTH_CHECK_URL_LOCAL="http://localhost:3002"
HEALTH_CHECK_URL_PUBLIC="https://app.quz.ma/8-bit-mancala"
PM2_APP_NAME="8-bit-mancala"

# --- Script Logic ---

# Function to print colored output
print_status() {
  echo -e "\033[1;34m>>> $1\033[0m"
}

print_success() {
  echo -e "\033[1;32m✅ $1\033[0m"
}

print_warning() {
  echo -e "\033[1;33m⚠️  $1\033[0m"
}

print_error() {
  echo -e "\033[1;31m❌ $1\033[0m"
}

# 1. Verify we're in a git repository
if [ ! -d ".git" ]; then
  print_error "This script must be run from within a git repository."
  exit 1
fi

print_status "Running update script in directory: $APP_DIR"

# 2. Save any local server changes
print_status "Stashing any local changes..."
git stash push -m "Auto-stash before update on $(date)"

# 3. Pull latest changes from GitHub
print_status "Pulling latest changes from origin/main..."
git pull origin main

# 4. Update dependencies if package.json changed
print_status "Checking for dependency updates..."
if git diff --name-only HEAD~1 HEAD | grep -q "package.json"; then
  print_status "package.json changed. Updating dependencies..."
  npm install --production
  print_success "Dependencies updated."
else
  print_status "No dependency changes detected."
fi

# 5. Check if .env needs updating
print_status "Checking for environment variable updates..."
if [ -f ".env.example" ] && [ -f ".env" ]; then
  # This command finds lines in .env.example that are not in .env
  NEW_VARS=$(comm -13 <(grep -v '^#' .env | grep -v '^$' | cut -d'=' -f1 | sort) <(grep -v '^#' .env.example | grep -v '^$' | cut -d'=' -f1 | sort))
  if [ -n "$NEW_VARS" ]; then
    print_warning "New environment variables detected in .env.example:"
    echo "$NEW_VARS"
    print_warning "Please update your .env file manually if needed."
  else
    print_success "No new environment variables detected."
  fi
else
  print_warning ".env or .env.example not found. Skipping environment check."
fi

# 6. Restart the application using PM2
print_status "Restarting the application via PM2..."
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME"
  print_success "Application restarted via PM2."
else
  print_warning "PM2 app '$PM2_APP_NAME' not found. Starting it now..."
  cd "$APP_DIR"
  pm2 start server.js --name "$PM2_APP_NAME"
  pm2 save
  print_success "Application started via PM2."
fi

# 7. Verify it's working
print_status "Waiting for the application to start..."
sleep 5

print_status "Performing health check on $HEALTH_CHECK_URL_LOCAL..."
if curl -s -f "$HEALTH_CHECK_URL_LOCAL" > /dev/null; then
  print_success "Local health check passed."
else
  print_error "Local health check failed. Check PM2 logs: pm2 logs $PM2_APP_NAME"
  # Optionally, you could exit here if the local check fails
  # exit 1
fi

print_status "Performing health check on $HEALTH_CHECK_URL_PUBLIC..."
if curl -s -f "$HEALTH_CHECK_URL_PUBLIC" > /dev/null; then
  print_success "Public health check passed."
else
  print_error "Public health check failed. Check Nginx configuration and logs."
fi

print_success "Production server update complete!"
