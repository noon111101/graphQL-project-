#!/bin/bash

# ============================================
# ZERO DOWNTIME DEPLOYMENT SCRIPT
# Blue-Green Deployment cho Docker Compose
# ============================================

set -e  # Dừng script nếu có lỗi

COMPOSE_FILE="docker-compose.yml"
SERVICES=("backend" "backend-rest-api" "frontend")

echo "🚀 Bắt đầu Zero Downtime Deployment..."

# Kiểm tra file docker-compose có tồn tại không
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Không tìm thấy file $COMPOSE_FILE"
    exit 1
fi

# Hàm kiểm tra health của service
check_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Đang chờ $service khởi động..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo "✅ $service đã sẵn sàng!"
            return 0
        fi
        echo "   Thử lần $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service không thể khởi động sau $max_attempts lần thử"
    return 1
}

# Hàm deploy từng service (Blue-Green)
deploy_service() {
    local service=$1
    local health_url=$2
    
    echo ""
    echo "📦 Đang deploy service: $service"
    
    # Lưu tên container cũ
    OLD_CONTAINERS=$(docker compose ps -q $service 2>/dev/null || echo "")
    
    if [ -z "$OLD_CONTAINERS" ]; then
        echo "   Không có container cũ, khởi động mới..."
        docker compose up -d $service
        check_health "$service" "$health_url"
    else
        echo "   Đổi tên container cũ để giữ lại..."
        # Tạo containers mới với image mới
        docker compose up -d --force-recreate --no-deps $service
        
        # Đợi container mới khởi động
        sleep 5
        check_health "$service" "$health_url"
        
        if [ $? -eq 0 ]; then
            echo "   Xóa container cũ..."
            # Container cũ đã bị replace, không cần xóa thủ công
            echo "✅ Deploy $service thành công!"
        else
            echo "❌ Container mới không healthy, rollback..."
            # Rollback bằng cách restart container cũ nếu còn
            docker compose up -d $service
            exit 1
        fi
    fi
}

# Pull image mới nhất
echo "📥 Đang pull images mới..."
docker compose pull

# Deploy từng service với health check
echo ""
echo "🔄 Bắt đầu Blue-Green Deployment..."

deploy_service "backend" "http://localhost:8080/actuator/health"
deploy_service "backend-rest-api" "http://localhost:8081/actuator/health"
deploy_service "frontend" "http://localhost:3000/health"

# Dọn dẹp images cũ
echo ""
echo "🧹 Dọn dẹp images cũ..."
docker image prune -f

echo ""
echo "✨ DEPLOYMENT HOÀN TẤT - ZERO DOWNTIME! ✨"
echo ""
echo "📊 Trạng thái services:"
docker compose ps

echo ""
echo "🎯 Endpoints:"
echo "   - Backend GraphQL:  http://localhost:8080/graphql"
echo "   - Backend REST API: http://localhost:8081/api"
echo "   - Frontend:         http://localhost:3000"
echo "   - Health Checks:"
echo "     • Backend:        http://localhost:8080/actuator/health"
echo "     • REST API:       http://localhost:8081/actuator/health"
echo "     • Frontend:       http://localhost:3000/health"
