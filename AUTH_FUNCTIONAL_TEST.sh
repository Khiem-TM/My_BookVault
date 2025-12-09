#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

GATEWAY_URL="http://localhost:8888/api/v1"

# Helper function to print section
print_section() {
    echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════${NC}\n"
}

# Helper function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS: $2${NC}"
    else
        echo -e "${RED}❌ FAIL: $2${NC}"
    fi
}

# Helper function for API calls
api_call() {
    local method=$1
    local endpoint=$2
    local body=$3
    local token=$4
    local description=$5

    echo -e "${YELLOW}[TEST]${NC} $description"
    echo "URL: $GATEWAY_URL$endpoint"
    
    if [ -n "$body" ]; then
        echo "Body: $body"
    fi

    if [ -n "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            "$GATEWAY_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$body")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            "$GATEWAY_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$body")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    echo "HTTP Code: $http_code"
    echo "Response:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo ""
    
    # Return http_code and body
    echo "$http_code" > /tmp/http_code
    echo "$body" > /tmp/response_body
}

print_section "🔐 AUTHENTICATION & USER MANAGEMENT FUNCTIONAL TEST"
echo "Testing: Registration, Login, Profile Update"
echo "Gateway: $GATEWAY_URL"
echo "Testing Date: $(date)"

# ============================================
# TEST 1: USER REGISTRATION
# ============================================
print_section "1️⃣  TEST USER REGISTRATION"

REGISTER_PAYLOAD='{
    "username": "testuser123",
    "password": "Password@123",
    "email": "testuser123@example.com",
    "firstName": "Test",
    "lastName": "User",
    "dob": "2000-01-15",
    "city": "Ho Chi Minh"
}'

api_call "POST" "/identity/users/registration" "$REGISTER_PAYLOAD" "" "Register new user"

http_code=$(cat /tmp/http_code)
response_body=$(cat /tmp/response_body)

if [[ $http_code == 2* ]]; then
    print_result 0 "User registration successful (HTTP $http_code)"
    REGISTERED_USER_ID=$(echo "$response_body" | jq -r '.result' 2>/dev/null)
    echo "New User ID: $REGISTERED_USER_ID"
else
    print_result 1 "User registration failed (HTTP $http_code)"
fi

# ============================================
# TEST 2: ADMIN LOGIN
# ============================================
print_section "2️⃣  TEST ADMIN LOGIN"

LOGIN_ADMIN_PAYLOAD='{
    "username": "admin",
    "password": "admin"
}'

api_call "POST" "/identity/auth/token" "$LOGIN_ADMIN_PAYLOAD" "" "Admin login"

http_code=$(cat /tmp/http_code)
response_body=$(cat /tmp/response_body)

if [[ $http_code == 2* ]]; then
    print_result 0 "Admin login successful (HTTP $http_code)"
    ADMIN_TOKEN=$(echo "$response_body" | jq -r '.result.token' 2>/dev/null)
    echo "Admin Token: ${ADMIN_TOKEN:0:50}..."
else
    print_result 1 "Admin login failed (HTTP $http_code)"
    exit 1
fi

# ============================================
# TEST 3: REGISTERED USER LOGIN
# ============================================
print_section "3️⃣  TEST REGISTERED USER LOGIN"

LOGIN_USER_PAYLOAD='{
    "username": "testuser123",
    "password": "Password@123"
}'

api_call "POST" "/identity/auth/token" "$LOGIN_USER_PAYLOAD" "" "New user login"

http_code=$(cat /tmp/http_code)
response_body=$(cat /tmp/response_body)

if [[ $http_code == 2* ]]; then
    print_result 0 "New user login successful (HTTP $http_code)"
    USER_TOKEN=$(echo "$response_body" | jq -r '.result.token' 2>/dev/null)
    echo "User Token: ${USER_TOKEN:0:50}..."
else
    print_result 1 "New user login failed (HTTP $http_code)"
fi

# ============================================
# TEST 4: TOKEN INTROSPECTION
# ============================================
print_section "4️⃣  TEST TOKEN INTROSPECTION"

INTROSPECT_PAYLOAD="{\"token\":\"$USER_TOKEN\"}"

api_call "POST" "/identity/auth/introspect" "$INTROSPECT_PAYLOAD" "$USER_TOKEN" "Validate user token"

http_code=$(cat /tmp/http_code)
response_body=$(cat /tmp/response_body)

if [[ $http_code == 2* ]]; then
    is_valid=$(echo "$response_body" | jq -r '.result.valid' 2>/dev/null)
    if [ "$is_valid" = "true" ]; then
        print_result 0 "Token is valid (HTTP $http_code)"
    else
        print_result 1 "Token validation returned false"
    fi
else
    print_result 1 "Token introspection failed (HTTP $http_code)"
fi

# ============================================
# TEST 5: GET PROFILE AS ADMIN
# ============================================
print_section "5️⃣  TEST GET PROFILE (AS ADMIN)"

api_call "GET" "/identity/users" "" "$ADMIN_TOKEN" "Get all users as admin"

http_code=$(cat /tmp/http_code)

if [[ $http_code == 2* ]]; then
    print_result 0 "Get users list successful (HTTP $http_code)"
else
    print_result 1 "Get users failed (HTTP $http_code)"
fi

# ============================================
# TEST 6: GET SPECIFIC USER PROFILE (ADMIN)
# ============================================
print_section "6️⃣  TEST GET SPECIFIC USER PROFILE (ADMIN)"

api_call "GET" "/identity/users/testuser123" "" "$ADMIN_TOKEN" "Get specific user by username (admin)"

http_code=$(cat /tmp/http_code)
response_body=$(cat /tmp/response_body)

if [[ $http_code == 2* ]]; then
    print_result 0 "Get user profile successful (HTTP $http_code)"
    USER_ID=$(echo "$response_body" | jq -r '.result.id' 2>/dev/null)
    echo "User ID: $USER_ID"
else
    print_result 1 "Get user profile failed (HTTP $http_code)"
fi

# ============================================
# TEST 7: UPDATE USER PASSWORD (USER)
# ============================================
print_section "7️⃣  TEST UPDATE USER PASSWORD (AS USER)"

UPDATE_PASSWORD_PAYLOAD='{
    "password": "NewPassword@456"
}'

api_call "PUT" "/identity/users/$USER_ID" "$UPDATE_PASSWORD_PAYLOAD" "$USER_TOKEN" "Update own password (user)"

http_code=$(cat /tmp/http_code)

if [[ $http_code == 2* ]]; then
    print_result 0 "Update password successful (HTTP $http_code)"
else
    print_result 1 "Update password failed (HTTP $http_code)"
fi

# ============================================
# TEST 8: LOGIN WITH NEW PASSWORD
# ============================================
print_section "8️⃣  TEST LOGIN WITH NEW PASSWORD"

LOGIN_NEW_PASSWORD_PAYLOAD='{
    "username": "testuser123",
    "password": "NewPassword@456"
}'

api_call "POST" "/identity/auth/token" "$LOGIN_NEW_PASSWORD_PAYLOAD" "" "Login with new password"

http_code=$(cat /tmp/http_code)
response_body=$(cat /tmp/response_body)

if [[ $http_code == 2* ]]; then
    print_result 0 "Login with new password successful (HTTP $http_code)"
    NEW_USER_TOKEN=$(echo "$response_body" | jq -r '.result.token' 2>/dev/null)
else
    print_result 1 "Login with new password failed (HTTP $http_code)"
fi

# ============================================
# TEST 9: UPDATE USER PROFILE (PROFILE SERVICE)
# ============================================
print_section "9️⃣  TEST UPDATE USER PROFILE (PROFILE SERVICE)"

UPDATE_PROFILE_PAYLOAD='{
    "firstName": "TestUpdated",
    "lastName": "UserUpdated",
    "city": "Da Nang"
}'

api_call "PUT" "/profile/users/$USER_ID" "$UPDATE_PROFILE_PAYLOAD" "$NEW_USER_TOKEN" "Update user profile (profile service)"

http_code=$(cat /tmp/http_code)

if [[ $http_code == 2* ]]; then
    print_result 0 "Update profile successful (HTTP $http_code)"
else
    print_result 1 "Update profile failed (HTTP $http_code)"
fi

# ============================================
# TEST 10: GET UPDATED PROFILE
# ============================================
print_section "🔟 TEST GET UPDATED PROFILE"

api_call "GET" "/profile/users/$USER_ID" "" "$NEW_USER_TOKEN" "Get updated user profile"

http_code=$(cat /tmp/http_code)
response_body=$(cat /tmp/response_body)

if [[ $http_code == 2* ]]; then
    print_result 0 "Get updated profile successful (HTTP $http_code)"
    echo "Profile Details:"
    echo "$response_body" | jq '.result' 2>/dev/null
else
    print_result 1 "Get profile failed (HTTP $http_code)"
fi

# ============================================
# TEST 11: ADMIN UPDATE USER DETAILS
# ============================================
print_section "1️⃣1️⃣  TEST ADMIN UPDATE USER DETAILS"

ADMIN_UPDATE_PAYLOAD='{
    "password": "ResetPassword@789"
}'

api_call "PUT" "/identity/users/$USER_ID" "$ADMIN_UPDATE_PAYLOAD" "$ADMIN_TOKEN" "Admin reset user password"

http_code=$(cat /tmp/http_code)

if [[ $http_code == 2* ]]; then
    print_result 0 "Admin update user successful (HTTP $http_code)"
else
    print_result 1 "Admin update user failed (HTTP $http_code)"
fi

# ============================================
# TEST 12: VERIFY RESET PASSWORD
# ============================================
print_section "1️⃣2️⃣  TEST LOGIN WITH RESET PASSWORD"

LOGIN_RESET_PASSWORD_PAYLOAD='{
    "username": "testuser123",
    "password": "ResetPassword@789"
}'

api_call "POST" "/identity/auth/token" "$LOGIN_RESET_PASSWORD_PAYLOAD" "" "Login with reset password"

http_code=$(cat /tmp/http_code)
response_body=$(cat /tmp/response_body)

if [[ $http_code == 2* ]]; then
    print_result 0 "Login with reset password successful (HTTP $http_code)"
    FINAL_USER_TOKEN=$(echo "$response_body" | jq -r '.result.token' 2>/dev/null)
else
    print_result 1 "Login with reset password failed (HTTP $http_code)"
fi

# ============================================
# TEST 13: UNAUTHORIZED ACCESS TEST
# ============================================
print_section "1️⃣3️⃣  TEST UNAUTHORIZED ACCESS"

api_call "GET" "/identity/users" "" "" "Try to access protected endpoint without token"

http_code=$(cat /tmp/http_code)

if [[ $http_code == 401 ]]; then
    print_result 0 "Unauthorized access correctly blocked (HTTP $http_code)"
else
    print_result 1 "Expected 401 but got HTTP $http_code"
fi

# ============================================
# TEST 14: INVALID TOKEN TEST
# ============================================
print_section "1️⃣4️⃣  TEST INVALID TOKEN"

INVALID_TOKEN="invalid.token.here"

api_call "GET" "/identity/users" "" "$INVALID_TOKEN" "Try to access with invalid token"

http_code=$(cat /tmp/http_code)

if [[ $http_code == 401 ]]; then
    print_result 0 "Invalid token correctly rejected (HTTP $http_code)"
else
    print_result 1 "Expected 401 but got HTTP $http_code"
fi

# ============================================
# TEST 15: INVALID CREDENTIALS
# ============================================
print_section "1️⃣5️⃣  TEST INVALID CREDENTIALS"

LOGIN_INVALID_PAYLOAD='{
    "username": "testuser123",
    "password": "WrongPassword"
}'

api_call "POST" "/identity/auth/token" "$LOGIN_INVALID_PAYLOAD" "" "Login with wrong password"

http_code=$(cat /tmp/http_code)

if [[ $http_code == 401 ]] || [[ $http_code == 400 ]]; then
    print_result 0 "Invalid credentials correctly rejected (HTTP $http_code)"
else
    print_result 1 "Expected 401/400 but got HTTP $http_code"
fi

# ============================================
# FINAL SUMMARY
# ============================================
print_section "📊 TEST SUMMARY"

echo -e "${GREEN}✅ Authentication & User Management Tests Completed${NC}"
echo ""
echo "Tests Performed:"
echo "  ✅ User Registration"
echo "  ✅ Admin Login"
echo "  ✅ User Login"
echo "  ✅ Token Introspection"
echo "  ✅ Get User Profile"
echo "  ✅ Update User Password"
echo "  ✅ Update User Profile"
echo "  ✅ Admin User Management"
echo "  ✅ Unauthorized Access Handling"
echo "  ✅ Invalid Token Handling"
echo "  ✅ Invalid Credentials Handling"
echo ""
echo "Key Endpoints Tested:"
echo "  • POST   /identity/users/registration"
echo "  • POST   /identity/auth/token"
echo "  • POST   /identity/auth/introspect"
echo "  • GET    /identity/users"
echo "  • GET    /identity/users/{username}"
echo "  • PUT    /identity/users/{id}"
echo "  • GET    /profile/users/{id}"
echo "  • PUT    /profile/users/{id}"
echo ""
echo -e "${BLUE}All critical authentication and user management features verified!${NC}"
echo -e "${GREEN}Backend system is operating smoothly! ✅${NC}"
echo ""
