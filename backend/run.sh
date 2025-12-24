#!/bin/bash

# Script to run the GraphQL backend

echo "🚀 Starting GraphQL Backend..."

# Check if Maven is installed
if ! command -v mvn &> /dev/null
then
    echo "❌ Maven is not installed. Please install Maven first."
    echo "   You can install it using Homebrew: brew install maven"
    exit 1
fi

# Clean and compile
echo "📦 Compiling project..."
mvn clean compile

# Run the application
echo "▶️  Starting Spring Boot application..."
mvn spring-boot:run

