#!/bin/bash

# Quick Start Script for Supply Chain Risk Analyzer
# Run this script to set up and start the project

echo "🌍 Supply Chain Risk Analyzer - Setup Script"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env if not exists
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file..."
    cat > .env << EOF
PORT=5000
NODE_ENV=development
NEWSAPI_KEY=your_newsapi_key_here
OPENWEATHER_KEY=your_openweather_key_here
EIA_KEY=your_eia_key_here
EOF
    echo "✅ .env file created"
fi

# Start server
echo ""
echo "🚀 Starting backend server..."
echo "Backend URL: http://localhost:5000"
echo "Open dashboard at: http://localhost:3000 (after running npm run serve in another terminal)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
