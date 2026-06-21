#!/bin/bash

# DUNELI Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🎙️  DUNELI Deployment Script"
echo "=============================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_status "Please copy .env.example to .env and fill in your Firebase credentials:"
    print_status "  cp .env.example .env"
    exit 1
fi

print_success ".env file found"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI not found!"
    print_status "Install it with: npm install -g firebase-tools"
    exit 1
fi

print_success "Firebase CLI is installed"

# Menu
echo ""
echo "What would you like to do?"
echo "1) Deploy Everything (Rules + Functions + Hosting)"
echo "2) Deploy Firestore Rules Only"
echo "3) Deploy Cloud Functions Only"
echo "4) Deploy Hosting Only"
echo "5) Build Functions"
echo "6) Run Local Development Server"
echo "7) Start Firebase Emulators"
echo "8) View Function Logs"
echo "9) Exit"
echo ""
read -p "Enter your choice (1-9): " choice

case $choice in
    1)
        print_status "Deploying everything..."
        
        # Deploy Firestore rules
        print_status "Deploying Firestore rules..."
        firebase deploy --only firestore:rules
        print_success "Firestore rules deployed"
        
        # Deploy Firestore indexes
        print_status "Deploying Firestore indexes..."
        firebase deploy --only firestore:indexes
        print_success "Firestore indexes deployed (may take a few minutes to build)"
        
        # Build and deploy functions
        print_status "Building Cloud Functions..."
        cd functions
        npm run build
        cd ..
        print_success "Cloud Functions built"
        
        print_status "Deploying Cloud Functions..."
        firebase deploy --only functions
        print_success "Cloud Functions deployed"
        
        # Build and deploy hosting
        print_status "Building frontend..."
        npm run build
        print_success "Frontend built"
        
        print_status "Deploying to Firebase Hosting..."
        firebase deploy --only hosting
        print_success "Hosting deployed"
        
        print_success "✨ Everything deployed successfully!"
        ;;
        
    2)
        print_status "Deploying Firestore rules..."
        firebase deploy --only firestore:rules
        print_success "Firestore rules deployed"
        
        print_status "Deploying Firestore indexes..."
        firebase deploy --only firestore:indexes
        print_success "Firestore indexes deployed"
        ;;
        
    3)
        print_status "Building Cloud Functions..."
        cd functions
        npm run build
        cd ..
        print_success "Cloud Functions built"
        
        print_status "Deploying Cloud Functions..."
        firebase deploy --only functions
        print_success "Cloud Functions deployed"
        ;;
        
    4)
        print_status "Building frontend..."
        npm run build
        print_success "Frontend built"
        
        print_status "Deploying to Firebase Hosting..."
        firebase deploy --only hosting
        print_success "Hosting deployed"
        ;;
        
    5)
        print_status "Building Cloud Functions..."
        cd functions
        npm run build
        cd ..
        print_success "Cloud Functions built"
        ;;
        
    6)
        print_status "Starting development server..."
        npm run dev
        ;;
        
    7)
        print_status "Starting Firebase Emulators..."
        firebase emulators:start
        ;;
        
    8)
        print_status "Fetching function logs..."
        firebase functions:log --limit 50
        ;;
        
    9)
        print_status "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "Done! 🎉"
