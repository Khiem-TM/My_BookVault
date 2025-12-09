#!/bin/bash

################################################################################
# MyBook Automated Health Check & Monitoring System
# Purpose: Continuous system health monitoring and alerting
# Version: 1.0
# Last Updated: December 9, 2024
################################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROMETHEUS_URL=${PROMETHEUS_URL:-"http://localhost:9090"}
SLACK_WEBHOOK=${SLACK_WEBHOOK:-""}
EMAIL_TO=${EMAIL_TO:-"ops@mybook.com"}
LOG_DIR=${LOG_DIR:-"/var/log/mybook"}
ALERT_THRESHOLD_ERROR_RATE=0.01  # 1%
ALERT_THRESHOLD_LATENCY=1000     # 1000ms
ALERT_THRESHOLD_MEMORY_GB=1.5
ALERT_THRESHOLD_CPU=0.8

# Create log directory
mkdir -p "$LOG_DIR"

# ============================================================================
# Utility Functions
# ============================================================================

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_DIR/health-check.log"
}

alert() {
  local severity=$1
  local message=$2
  
  log "[$severity] $message"
  
  if [ -n "$SLACK_WEBHOOK" ]; then
    send_slack_alert "$severity" "$message"
  fi
}

send_slack_alert() {
  local severity=$1
  local message=$2
  local color="danger"
  
  case $severity in
    "WARNING") color="warning" ;;
    "INFO") color="good" ;;
    "ERROR") color="danger" ;;
  esac
  
  curl -X POST "$SLACK_WEBHOOK" \
    -H 'Content-type: application/json' \
    -d "{
      \"attachments\": [{
        \"color\": \"$color\",
        \"title\": \"MyBook Alert - $severity\",
        \"text\": \"$message\",
        \"ts\": $(date +%s)
      }]
    }" 2>/dev/null || true
}

# ============================================================================
# Service Health Checks
# ============================================================================

check_docker_services() {
  log "Checking Docker services..."
  
  local services=("api-gateway" "identity-service" "profile-service" "book-service" 
                   "review-service" "library-service" "order-service" "payment-service" 
                   "post-service" "chat-service" "file-service" "notification-service" 
                   "transaction-service")
  
  local unhealthy=0
  
  for service in "${services[@]}"; do
    local status=$(docker compose ps "$service" --format "{{.State}}" 2>/dev/null || echo "missing")
    local health=$(docker compose ps "$service" --format "{{.Health}}" 2>/dev/null || echo "unknown")
    
    if [ "$status" != "running" ]; then
      alert "ERROR" "Service $service is not running (status: $status)"
      unhealthy=$((unhealthy + 1))
    elif [ "$health" = "unhealthy" ]; then
      alert "WARNING" "Service $service is unhealthy"
      unhealthy=$((unhealthy + 1))
    fi
  done
  
  if [ $unhealthy -eq 0 ]; then
    echo -e "${GREEN}✅ All services healthy${NC}"
    return 0
  else
    echo -e "${RED}❌ $unhealthy services unhealthy${NC}"
    return 1
  fi
}

check_api_gateway() {
  log "Checking API Gateway..."
  
  local response=$(curl -s -w "\n%{http_code}" http://localhost:8888/health 2>/dev/null || echo "503")
  local http_code=$(echo "$response" | tail -1)
  
  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ API Gateway healthy${NC}"
    return 0
  else
    alert "ERROR" "API Gateway returned HTTP $http_code"
    return 1
  fi
}

check_database_connectivity() {
  log "Checking database connectivity..."
  
  local mysql_ok=0
  local mongo_ok=0
  local redis_ok=0
  
  # MySQL
  if docker exec mysql mysql -h localhost -u root -p"${MYSQL_PASSWORD}" -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MySQL connected${NC}"
    mysql_ok=1
  else
    alert "ERROR" "MySQL connection failed"
  fi
  
  # MongoDB
  if docker exec mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB connected${NC}"
    mongo_ok=1
  else
    alert "ERROR" "MongoDB connection failed"
  fi
  
  # Redis
  if docker exec redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis connected${NC}"
    redis_ok=1
  else
    alert "ERROR" "Redis connection failed"
  fi
  
  if [ $mysql_ok -eq 1 ] && [ $mongo_ok -eq 1 ] && [ $redis_ok -eq 1 ]; then
    return 0
  else
    return 1
  fi
}

# ============================================================================
# Performance Metrics
# ============================================================================

check_error_rate() {
  log "Checking error rate..."
  
  local query='rate(http_requests_total{status=~"5.."}[5m])'
  local error_rate=$(curl -s "${PROMETHEUS_URL}/api/v1/query?query=${query}" | jq '.data.result[0].value[1]' 2>/dev/null | tr -d '"' || echo "0")
  
  if (( $(echo "$error_rate > $ALERT_THRESHOLD_ERROR_RATE" | bc -l) )); then
    alert "WARNING" "High error rate detected: ${error_rate}% (threshold: ${ALERT_THRESHOLD_ERROR_RATE}%)"
    echo -e "${YELLOW}⚠️  Error rate: ${error_rate}%${NC}"
    return 1
  else
    echo -e "${GREEN}✅ Error rate: ${error_rate}% (normal)${NC}"
    return 0
  fi
}

check_latency() {
  log "Checking request latency..."
  
  local query='histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))'
  local latency=$(curl -s "${PROMETHEUS_URL}/api/v1/query?query=${query}" | jq '.data.result[0].value[1]' 2>/dev/null | tr -d '"' || echo "0")
  local latency_ms=$(echo "$latency * 1000" | bc 2>/dev/null || echo "0")
  
  if (( $(echo "$latency_ms > $ALERT_THRESHOLD_LATENCY" | bc -l) )); then
    alert "WARNING" "High latency detected: ${latency_ms}ms (p95, threshold: ${ALERT_THRESHOLD_LATENCY}ms)"
    echo -e "${YELLOW}⚠️  P95 Latency: ${latency_ms}ms${NC}"
    return 1
  else
    echo -e "${GREEN}✅ P95 Latency: ${latency_ms}ms (normal)${NC}"
    return 0
  fi
}

check_resource_usage() {
  log "Checking resource usage..."
  
  local memory_exceeded=0
  local cpu_exceeded=0
  
  # Memory
  while IFS= read -r line; do
    local container=$(echo "$line" | awk '{print $1}')
    local memory=$(echo "$line" | awk '{print $2}' | sed 's/GiB//')
    
    if (( $(echo "$memory > $ALERT_THRESHOLD_MEMORY_GB" | bc -l) )); then
      alert "WARNING" "High memory usage: $container using ${memory}GB"
      memory_exceeded=$((memory_exceeded + 1))
    fi
  done < <(docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}" | grep -v "CONTAINER" | awk '{print $1, $(NF-1)}' | sed 's|/.*||')
  
  # CPU
  docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}" | grep -v "CONTAINER" | while read -r line; do
    local container=$(echo "$line" | awk '{print $1}')
    local cpu=$(echo "$line" | awk '{print $NF}' | sed 's/%//')
    
    if (( $(echo "$cpu > $ALERT_THRESHOLD_CPU" | bc -l) )); then
      alert "WARNING" "High CPU usage: $container using ${cpu}%"
      cpu_exceeded=$((cpu_exceeded + 1))
    fi
  done
  
  if [ $memory_exceeded -eq 0 ] && [ $cpu_exceeded -eq 0 ]; then
    echo -e "${GREEN}✅ Resource usage normal${NC}"
    return 0
  else
    return 1
  fi
}

check_disk_space() {
  log "Checking disk space..."
  
  local threshold=90  # Alert if > 90% used
  
  while IFS= read -r line; do
    local usage=$(echo "$line" | awk '{print $5}' | sed 's/%//')
    local mount=$(echo "$line" | awk '{print $NF}')
    
    if [ "$usage" -gt "$threshold" ]; then
      alert "WARNING" "High disk usage on $mount: ${usage}%"
      echo -e "${YELLOW}⚠️  $mount: ${usage}%${NC}"
      return 1
    fi
  done < <(df -h | grep -v "Filesystem")
  
  echo -e "${GREEN}✅ Disk space normal${NC}"
  return 0
}

# ============================================================================
# Database Health
# ============================================================================

check_database_replication() {
  log "Checking database replication..."
  
  # MySQL replication (if set up)
  docker exec mysql mysql -u root -p"${MYSQL_PASSWORD}" -e "SHOW SLAVE STATUS\G" > /dev/null 2>&1 && \
    echo -e "${GREEN}✅ MySQL replication healthy${NC}" || \
    echo -e "${YELLOW}⚠️  MySQL replication not configured${NC}"
  
  # MongoDB replication set
  docker exec mongodb mongosh --eval "rs.status()" > /dev/null 2>&1 && \
    echo -e "${GREEN}✅ MongoDB replica set healthy${NC}" || \
    echo -e "${YELLOW}⚠️  MongoDB replica set not configured${NC}"
}

check_database_size() {
  log "Checking database size..."
  
  # MySQL
  local mysql_size=$(docker exec mysql du -sh /var/lib/mysql 2>/dev/null | awk '{print $1}' || echo "unknown")
  echo "MySQL size: $mysql_size"
  
  # MongoDB
  local mongo_size=$(docker exec mongodb du -sh /data/db 2>/dev/null | awk '{print $1}' || echo "unknown")
  echo "MongoDB size: $mongo_size"
}

check_backup_status() {
  log "Checking backup status..."
  
  local backup_dir="/backups/mysql"
  
  if [ ! -d "$backup_dir" ]; then
    alert "WARNING" "Backup directory not found: $backup_dir"
    return 1
  fi
  
  # Check if backup exists and is recent (within last 24 hours)
  local latest_backup=$(find "$backup_dir" -name "*.sql.gz" -mtime -1 2>/dev/null | sort -r | head -1)
  
  if [ -z "$latest_backup" ]; then
    alert "ERROR" "No recent backups found in $backup_dir"
    return 1
  fi
  
  local backup_age=$(find "$backup_dir" -name "*.sql.gz" -printf '%T@' 2>/dev/null | sort -r | head -1 | cut -d. -f1)
  local now=$(date +%s)
  local age_hours=$(( (now - backup_age) / 3600 ))
  
  if [ "$age_hours" -gt 24 ]; then
    alert "WARNING" "Latest backup is $age_hours hours old"
    echo -e "${YELLOW}⚠️  Latest backup: $age_hours hours ago${NC}"
    return 1
  else
    echo -e "${GREEN}✅ Latest backup: $age_hours hours ago${NC}"
    return 0
  fi
}

# ============================================================================
# Security Checks
# ============================================================================

check_security_issues() {
  log "Checking for security issues..."
  
  # Check for exposed secrets in logs
  local secret_patterns=("password" "api_key" "secret" "token")
  local found_secrets=0
  
  for pattern in "${secret_patterns[@]}"; do
    if docker compose logs | grep -i "$pattern" | grep -v "PASSWORD" > /dev/null 2>&1; then
      alert "WARNING" "Possible exposed secret found: $pattern"
      found_secrets=$((found_secrets + 1))
    fi
  done
  
  # Check for failed authentication attempts
  local failed_auths=$(docker compose logs | grep -i "unauthorized\|authentication failed" | wc -l)
  if [ "$failed_auths" -gt 10 ]; then
    alert "WARNING" "Multiple failed authentication attempts detected: $failed_auths"
  fi
  
  if [ $found_secrets -eq 0 ]; then
    echo -e "${GREEN}✅ No obvious security issues detected${NC}"
    return 0
  else
    return 1
  fi
}

# ============================================================================
# Business Metrics
# ============================================================================

check_business_metrics() {
  log "Checking business metrics..."
  
  # User registrations (last 24 hours)
  local registrations=$(docker exec mysql mysql -u root -p"${MYSQL_PASSWORD}" -e \
    "SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY);" -N 2>/dev/null || echo "0")
  echo "New registrations (24h): $registrations"
  
  # Active users (last hour)
  local active_users=$(docker exec mysql mysql -u root -p"${MYSQL_PASSWORD}" -e \
    "SELECT COUNT(DISTINCT user_id) FROM audit_log WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR);" -N 2>/dev/null || echo "0")
  echo "Active users (1h): $active_users"
  
  # Total books
  local total_books=$(docker exec mysql mysql -u root -p"${MYSQL_PASSWORD}" -e \
    "SELECT COUNT(*) FROM books;" -N 2>/dev/null || echo "0")
  echo "Total books: $total_books"
}

# ============================================================================
# Report Generation
# ============================================================================

generate_health_report() {
  local report_file="$LOG_DIR/health-report-$(date +%Y%m%d-%H%M%S).txt"
  
  cat > "$report_file" << EOF
================================================================================
                   MyBook Health Check Report
                   $(date +'%Y-%m-%d %H:%M:%S')
================================================================================

1. SERVICE STATUS
================================================================================
EOF
  
  docker compose ps >> "$report_file" 2>&1
  
  cat >> "$report_file" << EOF

2. RESOURCE USAGE
================================================================================
EOF
  
  docker stats --no-stream >> "$report_file" 2>&1
  
  cat >> "$report_file" << EOF

3. DATABASE STATUS
================================================================================
EOF
  
  docker exec mysql mysql -u root -p"${MYSQL_PASSWORD}" -e "SHOW VARIABLES LIKE 'max_connections'; SHOW STATUS LIKE 'Threads_connected';" >> "$report_file" 2>&1
  
  cat >> "$report_file" << EOF

4. RECENT ERRORS (Last 100)
================================================================================
EOF
  
  docker compose logs --tail=100 | grep -i error >> "$report_file" 2>&1
  
  echo "Health report generated: $report_file"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
  clear
  
  echo -e "${BLUE}"
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║          MyBook Health Check & Monitoring System           ║"
  echo "║                  $(date +'%Y-%m-%d %H:%M:%S')                  ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  
  log "Starting comprehensive health check..."
  
  local failures=0
  
  # Service checks
  echo -e "\n${BLUE}=== SERVICE HEALTH ===${NC}"
  check_docker_services || failures=$((failures + 1))
  check_api_gateway || failures=$((failures + 1))
  check_database_connectivity || failures=$((failures + 1))
  
  # Performance checks
  echo -e "\n${BLUE}=== PERFORMANCE METRICS ===${NC}"
  check_error_rate || failures=$((failures + 1))
  check_latency || failures=$((failures + 1))
  check_resource_usage || failures=$((failures + 1))
  check_disk_space || failures=$((failures + 1))
  
  # Database checks
  echo -e "\n${BLUE}=== DATABASE HEALTH ===${NC}"
  check_database_replication
  check_database_size
  check_backup_status || failures=$((failures + 1))
  
  # Security checks
  echo -e "\n${BLUE}=== SECURITY ===${NC}"
  check_security_issues
  
  # Business metrics
  echo -e "\n${BLUE}=== BUSINESS METRICS ===${NC}"
  check_business_metrics
  
  # Summary
  echo -e "\n${BLUE}=== SUMMARY ===${NC}"
  if [ $failures -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
  else
    echo -e "${RED}❌ $failures check(s) failed${NC}"
  fi
  
  # Generate report
  generate_health_report
  
  log "Health check completed with $failures failure(s)"
  
  return $failures
}

# Run main function
main "$@"
