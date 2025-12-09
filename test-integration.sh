#!/bin/bash

echo "🔧 Testing MyBook Frontend-Backend Integration"
echo "=============================================="

# Test API Gateway health
echo "1. Testing API Gateway health..."
API_RESPONSE=$(curl -s http://localhost:8888/actuator/health 2>/dev/null || echo "FAILED")
if [[ $API_RESPONSE == *"UP"* ]]; then
    echo "✅ API Gateway is healthy"
else
    echo "❌ API Gateway not responding"
fi

# Test login through Gateway
echo ""
echo "2. Testing login through API Gateway..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8888/api/v1/identity/auth/token \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin"}' 2>/dev/null)

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
    echo "✅ Login successful"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   Token obtained: ${TOKEN:0:20}..."
else
    echo "❌ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test my-info endpoint
echo ""
echo "3. Testing my-info endpoint..."
PROFILE_RESPONSE=$(curl -s -X GET "http://localhost:8888/api/v1/identity/users/my-info" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if [[ $PROFILE_RESPONSE == *"result"* ]] && [[ $PROFILE_RESPONSE != *"1401"* ]]; then
    echo "✅ Profile endpoint working"
    echo "   User info: $(echo $PROFILE_RESPONSE | grep -o '"username":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ Profile endpoint failed"
    echo "   Response: $PROFILE_RESPONSE"
fi

# Test books endpoint
echo ""
echo "4. Testing books endpoint..."
BOOKS_RESPONSE=$(curl -s -X GET "http://localhost:8888/api/v1/book/books" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if [[ $BOOKS_RESPONSE != *"1401"* ]]; then
    echo "✅ Books endpoint accessible"
else
    echo "❌ Books endpoint failed - authentication required"
fi

echo ""
echo "🎯 Integration Test Summary:"
echo "   Login: $(if [[ $LOGIN_RESPONSE == *"token"* ]]; then echo "✅ PASS"; else echo "❌ FAIL"; fi)"
echo "   Profile: $(if [[ $PROFILE_RESPONSE == *"result"* ]] && [[ $PROFILE_RESPONSE != *"1401"* ]]; then echo "✅ PASS"; else echo "❌ FAIL"; fi)"
echo "   Books: $(if [[ $BOOKS_RESPONSE != *"1401"* ]]; then echo "✅ PASS"; else echo "❌ FAIL"; fi)"

echo ""
echo "🚀 Next steps:"
echo "   1. Start frontend: cd client && npm run dev"
echo "   2. Open browser: http://localhost:5173"
echo "   3. Login with admin/admin"
echo "   4. Test profile page"
