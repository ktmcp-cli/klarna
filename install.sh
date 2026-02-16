#!/bin/bash
# Installation script for Klarna CLI

set -e

echo "=== Klarna CLI Installation ==="
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js version 18 or higher is required"
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "✓ Dependencies installed"
echo ""

# Link CLI globally
echo "Linking CLI globally..."
npm link

echo ""
echo "✓ CLI linked successfully"
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "⚠ Please edit .env and add your Klarna credentials:"
    echo "   KLARNA_USERNAME=your_username"
    echo "   KLARNA_PASSWORD=your_password"
    echo ""
fi

# Test installation
echo "Testing installation..."
if klarna --version &> /dev/null; then
    echo "✓ Installation successful!"
    echo ""
    echo "Run 'klarna --help' to get started"
else
    echo "✗ Installation test failed"
    exit 1
fi

echo ""
echo "=== Next Steps ==="
echo ""
echo "1. Set your Klarna credentials:"
echo "   klarna config set username YOUR_USERNAME"
echo "   klarna config set password YOUR_PASSWORD"
echo ""
echo "2. Verify configuration:"
echo "   klarna config show"
echo ""
echo "3. Try creating a session:"
echo "   klarna sessions create --file examples/session.json"
echo ""
echo "Documentation: README.md"
echo "Examples: examples/"
