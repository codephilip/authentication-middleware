#!/bin/bash

# Auth Middleware Submodule Update Script
# This script helps manage the auth-middleware submodule

set -e

SUBMODULE_PATH="shared/auth-middleware"
REPO_URL="git@github.com:codephilip/authentication-middleware.git"

# Colors for output
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

# Function to check if submodule exists
check_submodule() {
    if [ ! -d "$SUBMODULE_PATH" ]; then
        print_error "Submodule not found at $SUBMODULE_PATH"
        print_status "Run: git submodule add $REPO_URL $SUBMODULE_PATH"
        exit 1
    fi
}

# Function to add submodule
add_submodule() {
    print_status "Adding auth-middleware as submodule..."
    git submodule add $REPO_URL $SUBMODULE_PATH
    print_success "Submodule added successfully"
}

# Function to initialize submodule
init_submodule() {
    print_status "Initializing submodule..."
    git submodule update --init --recursive
    print_success "Submodule initialized successfully"
}

# Function to update to latest version
update_latest() {
    check_submodule
    print_status "Updating submodule to latest version..."
    
    cd $SUBMODULE_PATH
    git fetch origin
    git checkout origin/main
    cd ../..
    
    git add $SUBMODULE_PATH
    print_success "Submodule updated to latest version"
    print_warning "Don't forget to commit: git commit -m 'Update auth-middleware to latest'"
}

# Function to update to specific version
update_version() {
    check_submodule
    local version=$1
    
    if [ -z "$version" ]; then
        print_error "Please specify a version"
        print_status "Usage: $0 update-version <version>"
        exit 1
    fi
    
    print_status "Updating submodule to version $version..."
    
    cd $SUBMODULE_PATH
    git fetch --tags
    git checkout $version
    cd ../..
    
    git add $SUBMODULE_PATH
    print_success "Submodule updated to version $version"
    print_warning "Don't forget to commit: git commit -m 'Update auth-middleware to $version'"
}

# Function to install dependencies
install_deps() {
    check_submodule
    print_status "Installing submodule dependencies..."
    
    cd $SUBMODULE_PATH
    npm install
    cd ../..
    
    print_success "Dependencies installed successfully"
}

# Function to run tests
run_tests() {
    check_submodule
    print_status "Running submodule tests..."
    
    cd $SUBMODULE_PATH
    npm test
    cd ../..
    
    print_success "Tests completed successfully"
}

# Function to show available versions
show_versions() {
    check_submodule
    print_status "Available versions:"
    
    cd $SUBMODULE_PATH
    git tag --sort=-version:refname | head -10
    cd ../..
}

# Function to show current status
show_status() {
    check_submodule
    print_status "Current submodule status:"
    
    cd $SUBMODULE_PATH
    echo "Current commit: $(git rev-parse HEAD)"
    echo "Current branch: $(git branch --show-current)"
    echo "Latest commit: $(git log -1 --oneline)"
    cd ../..
}

# Function to show help
show_help() {
    echo "Auth Middleware Submodule Management Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  add              Add the submodule"
    echo "  init             Initialize the submodule"
    echo "  update-latest    Update to latest version"
    echo "  update-version   Update to specific version"
    echo "  install-deps     Install dependencies"
    echo "  test             Run tests"
    echo "  versions         Show available versions"
    echo "  status           Show current status"
    echo "  help             Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 add"
    echo "  $0 update-version v1.0.0"
    echo "  $0 install-deps"
}

# Main script logic
case "$1" in
    "add")
        add_submodule
        ;;
    "init")
        init_submodule
        ;;
    "update-latest")
        update_latest
        ;;
    "update-version")
        update_version "$2"
        ;;
    "install-deps")
        install_deps
        ;;
    "test")
        run_tests
        ;;
    "versions")
        show_versions
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 