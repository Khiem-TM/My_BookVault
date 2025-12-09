#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

GATEWAY_URL="http://localhost:8888/api/v1"
API_TOKEN="eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkZXZ0ZXJpYS5jb20iLCJzdWIiOiI1YjFiMzgzZC0xZGYxLTQ5ZDktYTJiOS1iMmYxOTliMTg3YTciLCJleHAiOjE3NjUyNzc5MTEsImlhdCI6MTc2NTI3NDMxMSwianRpIjoiMGNlNmQzZDItZDc1Ni00NDIxLThhYjUtYmNhYjQ5OTA4M2RmIiwic2NvcGUiOiJST0xFX0FETUlOIn0.KmzOly1ltxl7TEAiCKvLAIufKQk9wl0X4F7WYyf_TAhHxCfgivGrf_W94j0z8ggfKmyrSkjS0A3UuI6m2VnI-A"

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local body=$4
    local require_auth=$5

    echo -e "\n${YELLOW}[TEST] $description${NC}"
    echo "URL: $GATEWAY_URL$endpoint"

    if [ "$method" = "GET" ]; then
        if [ "$require_auth" = "true" ]; then
            response=$(curl -s -w "\n%{http_code}" -X GET \
                "$GATEWAY_URL$endpoint" \
                -H "Authorization: Bearer $API_TOKEN" \
                -H "Content-Type: application/json")
        else
            response=$(curl -s -w "\n%{http_code}" -X GET \
                "$GATEWAY_URL$endpoint" \
                -H "Content-Type: application/json")
        fi
    elif [ "$method" = "POST" ]; then
        if [ "$require_auth" = "true" ]; then
            response=$(curl -s -w "\n%{http_code}" -X POST \
                "$GATEWAY_URL$endpoint" \
                -H "Authorization: Bearer $API_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$body")
        else
            response=$(curl -s -w "\n%{http_code}" -X POST \
                "$GATEWAY_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$body")
        fi
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [[ $http_code =~ ^[2] ]]; then
        echo -e "${GREEN}✓ Status: $http_code${NC}"
        echo "Response: $(echo $body | jq . 2>/dev/null || echo $body | head -c 200)"
        return 0
    else
        echo -e "${RED}✗ Status: $http_code${NC}"
        echo "Response: $(echo $body | jq . 2>/dev/null || echo $body | head -c 200)"
        return 1
    fi
}

echo "=========================================="
echo "MyBook System Health Check"
echo "=========================================="

# 1. Identity Service Tests
echo -e "\n${YELLOW}========== IDENTITY SERVICE ==========${NC}"
test_endpoint "POST" "/identity/auth/token" "Login admin" \
    '{"username":"admin","password":"admin"}' "false"

test_endpoint "GET" "/identity/auth/introspect" "Introspect token" \
    "" "true"

# 2. Profile Service Tests
echo -e "\n${YELLOW}========== PROFILE SERVICE ==========${NC}"
test_endpoint "POST" "/profile/internal/users" "Create profile" \
    '{"firstName":"John","lastName":"Doe","city":"Ha Noi"}' "false"

test_endpoint "GET" "/profile/users/admin" "Get profile by username" \
    "" "true"

# 3. Review Service Tests
echo -e "\n${YELLOW}========== REVIEW SERVICE ==========${NC}"
test_endpoint "GET" "/review/ping" "Review service ping" \
    "" "false"

# 4. Post Service Tests
echo -e "\n${YELLOW}========== POST SERVICE ==========${NC}"
test_endpoint "GET" "/post/ping" "Post service ping" \
    "" "false"

# 5. File Service Tests
echo -e "\n${YELLOW}========== FILE SERVICE ==========${NC}"
test_endpoint "GET" "/file/ping" "File service ping" \
    "" "false"

# 6. Notification Service Tests
echo -e "\n${YELLOW}========== NOTIFICATION SERVICE ==========${NC}"
test_endpoint "GET" "/notification/ping" "Notification service ping" \
    "" "false"

# 7. Chat Service Tests
echo -e "\n${YELLOW}========== CHAT SERVICE ==========${NC}"
test_endpoint "GET" "/chat/ping" "Chat service ping" \
    "" "false"

# 8. Book Service Tests
echo -e "\n${YELLOW}========== BOOK SERVICE ==========${NC}"
test_endpoint "GET" "/book/ping" "Book service ping" \
    "" "false"

# 9. Order Service Tests
echo -e "\n${YELLOW}========== ORDER SERVICE ==========${NC}"
test_endpoint "GET" "/order/ping" "Order service ping" \
    "" "false"

# 10. Payment Service Tests
echo -e "\n${YELLOW}========== PAYMENT SERVICE ==========${NC}"
test_endpoint "GET" "/payment/ping" "Payment service ping" \
    "" "false"

# 11. Transaction Service Tests
echo -e "\n${YELLOW}========== TRANSACTION SERVICE ==========${NC}"
test_endpoint "GET" "/transaction/ping" "Transaction service ping" \
    "" "false"

# 12. Library Service Tests
echo -e "\n${YELLOW}========== LIBRARY SERVICE ==========${NC}"
test_endpoint "GET" "/library/ping" "Library service ping" \
    "" "false"

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}Health check completed!${NC}"
echo -e "${YELLOW}========================================${NC}\n"
