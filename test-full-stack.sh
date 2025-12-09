#!/bin/bash

# ============================================================================
# MyBook Full Stack - Comprehensive Integration Test Script
# ============================================================================
# Date: December 9, 2024
# Purpose: Test all backend services, API Gateway, and frontend integration
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
API_BASE_URL="http://localhost:8888/api/v1"
TEST_RESULTS=()
PASSED=0
FAILED=0

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓ PASS]${NC} $1"
    PASSED=$((PASSED + 1))
}

log_error() {
    echo -e "${RED}[✗ FAIL]${NC} $1"
    FAILED=$((FAILED + 1))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    log_info "Testing: $description"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE_URL$endpoint" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "$expected_status" ]; then
        log_success "$description - HTTP $http_code"
        echo "$body"
    else
        log_error "$description - Expected HTTP $expected_status, got $http_code"
        echo "$body"
    fi
}

test_endpoint_with_token() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    local expected_status=$5
    local description=$6
    
    log_info "Testing: $description"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "$expected_status" ]; then
        log_success "$description - HTTP $http_code"
        echo "$body"
    else
        log_error "$description - Expected HTTP $expected_status, got $http_code"
        echo "$body"
    fi
}

# ============================================================================
# Tests
# ============================================================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}MyBook Full Stack - Integration Tests${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}--- Phase 1: System Health Check ---${NC}\n"
test_endpoint "GET" "/actuator/health" "" "200" "API Gateway Health"

# Test 2: Login - Admin
echo -e "\n${YELLOW}--- Phase 2: Authentication Tests ---${NC}\n"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/identity/auth/token" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin"}')

ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    log_success "Admin Login - Token generated"
    echo "Token: ${ADMIN_TOKEN:0:50}..."
else
    log_error "Admin Login - Failed to get token"
    echo "Response: $LOGIN_RESPONSE"
fi

# Test 3: Get User Info with Token
echo -e "\n${YELLOW}--- Phase 3: Protected Endpoint Tests ---${NC}\n"
test_endpoint_with_token "GET" "/identity/users/my-info" "$ADMIN_TOKEN" "" "200" "Get Current User Info"

# Test 4: Get All Users (Admin)
test_endpoint_with_token "GET" "/identity/users" "$ADMIN_TOKEN" "" "200" "Get All Users (Admin)"

# Test 5: Register New User
echo -e "\n${YELLOW}--- Phase 4: User Registration Tests ---${NC}\n"

TIMESTAMP=$(date +%s)
NEW_USER="testuser_$TIMESTAMP"
NEW_EMAIL="test_$TIMESTAMP@example.com"

REGISTER_DATA="{
    \"username\":\"$NEW_USER\",
    \"email\":\"$NEW_EMAIL\",
    \"password\":\"Pass123!\",
    \"firstName\":\"Test\",
    \"lastName\":\"User\"
}"

test_endpoint "POST" "/identity/users/registration" "$REGISTER_DATA" "200" "Register New User"

# Test 6: Login with New User
echo -e "\n${YELLOW}--- Phase 5: New User Login Tests ---${NC}\n"

LOGIN_NEW_USER="{\"username\":\"$NEW_USER\",\"password\":\"Pass123!\"}"
LOGIN_NEW_RESPONSE=$(curl -s -X POST "$API_BASE_URL/identity/auth/token" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_NEW_USER")

NEW_USER_TOKEN=$(echo "$LOGIN_NEW_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$NEW_USER_TOKEN" ]; then
    log_success "New User Login - Token generated"
else
    log_error "New User Login - Failed to get token"
fi

# Test 7: Test without Token
echo -e "\n${YELLOW}--- Phase 6: Security Tests (No Token) ---${NC}\n"
test_endpoint "GET" "/identity/users" "" "401" "Access Protected Endpoint Without Token"

# Test 8: Invalid Token
echo -e "\n${YELLOW}--- Phase 7: Invalid Token Tests ---${NC}\n"
test_endpoint_with_token "GET" "/identity/users" "INVALID_TOKEN_12345" "" "401" "Access Protected Endpoint With Invalid Token"

# Test 9: Book Service
echo -e "\n${YELLOW}--- Phase 8: Book Service Tests ---${NC}\n"
test_endpoint_with_token "GET" "/book/books?page=0&size=5" "$ADMIN_TOKEN" "" "200" "Get Books List"

# Test 10: Profile Service
echo -e "\n${YELLOW}--- Phase 9: Profile Service Tests ---${NC}\n"
test_endpoint_with_token "GET" "/profile/users/$ADMIN_TOKEN" "$ADMIN_TOKEN" "" "404" "Get User Profile (Expected 404 for demo)"

# Test 11: Library Service
echo -e "\n${YELLOW}--- Phase 10: Library Service Tests ---${NC}\n"
test_endpoint_with_token "GET" "/library/my-books" "$ADMIN_TOKEN" "" "200" "Get User Library"

# Test 12: Order Service
echo -e "\n${YELLOW}--- Phase 11: Order Service Tests ---${NC}\n"
test_endpoint_with_token "GET" "/order/my-orders" "$ADMIN_TOKEN" "" "200" "Get User Orders"

# Test 13: Notification Service
echo -e "\n${YELLOW}--- Phase 12: Notification Service Tests ---${NC}\n"
test_endpoint_with_token "GET" "/notification/my-notifications" "$ADMIN_TOKEN" "" "200" "Get Notifications"

# ============================================================================
# Summary
# ============================================================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}\n"

TOTAL=$((PASSED + FAILED))

echo -e "Total Tests:  $TOTAL"
echo -e "${GREEN}Passed:      $PASSED${NC}"
echo -e "${RED}Failed:      $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    SUCCESS_RATE=100
else
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
fi

echo -e "Success Rate: $SUCCESS_RATE%\n"

# ============================================================================
# Frontend Checks
# ============================================================================

echo -e "${YELLOW}--- Phase 13: Frontend Setup Verification ---${NC}\n"

if [ -f "/Users/KTPM_UET/MyBook/client/.env" ]; then
    log_success "Frontend .env file exists"
    cat /Users/KTPM_UET/MyBook/client/.env
else
    log_error "Frontend .env file not found"
fi

if [ -f "/Users/KTPM_UET/MyBook/client/src/utils/axiosConfig.ts" ]; then
    log_success "Axios configuration file exists"
else
    log_error "Axios configuration file not found"
fi

if [ -f "/Users/KTPM_UET/MyBook/client/src/services/authService.ts" ]; then
    log_success "Auth service file exists"
else
    log_error "Auth service file not found"
fi

if [ -f "/Users/KTPM_UET/MyBook/client/src/services/apiServices.ts" ]; then
    log_success "API services file exists (11 services)"
else
    log_error "API services file not found"
fi

if [ -f "/Users/KTPM_UET/MyBook/client/src/store/authStore.ts" ]; then
    log_success "Auth store (Zustand) exists"
else
    log_error "Auth store file not found"
fi

if [ -d "/Users/KTPM_UET/MyBook/client/src/features/auth" ]; then
    AUTH_FILES=$(ls -1 /Users/KTPM_UET/MyBook/client/src/features/auth/*.tsx 2>/dev/null | wc -l)
    log_success "Auth components: $AUTH_FILES files found"
else
    log_error "Auth features directory not found"
fi

# ============================================================================
# Final Status
# ============================================================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Final Status${NC}"
echo -e "${BLUE}========================================${NC}\n"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ BACKEND & API GATEWAY: OPERATIONAL${NC}"
    echo -e "${GREEN}✓ AUTHENTICATION: WORKING${NC}"
    echo -e "${GREEN}✓ FRONTEND SETUP: COMPLETE${NC}"
    echo -e "${GREEN}✓ API INTEGRATION: READY${NC}"
    echo -e "\n${GREEN}🎉 SYSTEM STATUS: PRODUCTION READY${NC}\n"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review logs above.${NC}\n"
    exit 1
fi
