#!/bin/bash

# Script để build và run tất cả Docker containers

echo "=========================================="
echo "🚀 Building and Starting All Services"
echo "=========================================="

# Build và start tất cả containers
docker compose up --build -d

echo ""
echo "=========================================="
echo "✅ All services are starting..."
echo "=========================================="
echo ""
echo "📊 Service URLs:"
echo "  - Frontend:          http://localhost:3000"
echo "  - GraphQL Backend:   http://localhost:8080/graphiql"
echo "  - REST API Backend:  http://localhost:8081"
echo "  - H2 Console (GQL):  http://localhost:8080/h2-console"
echo "  - H2 Console (REST): http://localhost:8081/h2-console"
echo ""
echo "📝 Useful commands:"
echo "  - View logs:         docker compose logs -f"
echo "  - Stop services:     docker compose stop"
echo "  - Stop & remove:     docker compose down"
echo "  - Restart:           docker compose restart"
echo ""

# Hiển thị status của containers
echo "Container Status:"
docker compose ps
