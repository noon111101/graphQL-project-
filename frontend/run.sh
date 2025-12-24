#!/bin/bash

# Script to run the React frontend

echo "🚀 Starting React Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the application
echo "▶️  Starting development server..."
npm start

