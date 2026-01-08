#!/bin/bash

# ============================================
# ZERO DOWNTIME DEPLOYMENT SCRIPT
# Rolling Update cho Docker Compose
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

# Hàm deploy từng service (Rolling Update)
deploy_service() {
    local service=$1
    local health_url=$2
    
    echo ""
    echo "📦 Đang deploy service: $service"
    
    # Lấy số lượng container hiện tại
    local current_replicas=$(docker compose ps -q $service | wc -l)
    
    if [ $current_replicas -eq 0 ]; then
        echo "   Không có container cũ, khởi động mới..."
        docker compose up -d $service
        check_health "$service" "$health_url"
    else
        echo "   Scale up thêm 1 container mới..."
        docker compose up -d --scale $service=2 --no-recreate $service
        
        # Đợi container mới healthy
        sleep 5
        check_health "$service" "$health_url"
        
        if [ $? -eq 0 ]; then
            echo "   Tắt container cũ..."
            # Lấy container ID của container cũ nhất
            OLD_CONTAINER=$(docker compose ps -q $service | tail -n 1)
            docker stop $OLD_CONTAINER
            docker rm $OLD_CONTAINER
            
            echo "   Scale về 1 container..."
            docker compose up -d --scale $service=1 $service
            
            echo "✅ Deploy $service thành công!"
        else
            echo "❌ Container mới không healthy, rollback..."
            docker compose up -d --scale $service=1 $service
            exit 1
        fi
    fi
}

# Pull image mới nhất
echo "📥 Đang pull images mới..."
docker compose pull

# Deploy từng service với health check
echo ""
echo "🔄 Bắt đầu Rolling Update..."

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
