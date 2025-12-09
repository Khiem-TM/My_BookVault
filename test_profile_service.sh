#!/bin/bash

echo "🔍 Testing Profile Service Directly"
echo "===================================="

# Get admin token first
echo "Getting admin token..."
TOKEN=$(curl -s -X POST http://localhost:8888/api/v1/identity/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}' | jq -r '.result.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get admin token"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

# Get user ID
USER_RESPONSE=$(curl -s -X POST http://localhost:8888/api/v1/identity/auth/introspect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"token\": \"$TOKEN\"}")

USER_ID=$(echo $USER_RESPONSE | jq -r '.result.id // empty')
echo "User ID: $USER_ID"

if [ -z "$USER_ID" ]; then
  echo "❌ Could not get user ID"
  exit 1
fi

# Test profile service directly (bypass gateway)
echo ""
echo "1. Testing Profile Service directly on port 8081..."
DIRECT_RESPONSE=$(curl -s -X GET "http://localhost:8081/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Direct Profile Response: $DIRECT_RESPONSE"

# Test through gateway
echo ""
echo "2. Testing Profile Service through Gateway..."
GATEWAY_RESPONSE=$(curl -s -X GET "http://localhost:8888/api/v1/profile/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Gateway Profile Response: $GATEWAY_RESPONSE"

# Test profile ping
echo ""
echo "3. Testing Profile Service ping..."
PING_RESPONSE=$(curl -s -X GET "http://localhost:8081/ping")
echo "Profile Ping: $PING_RESPONSE"

# Check if profile exists, if not create one
echo ""
echo "4. Trying to create profile if not exists..."
CREATE_RESPONSE=$(curl -s -X POST "http://localhost:8888/api/v1/profile/internal/users" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"admin\",
    \"email\": \"admin@mybook.com\",
    \"firstName\": \"System\",
    \"lastName\": \"Admin\",
    \"dob\": \"1990-01-01\",
    \"city\": \"System\"
  }")
echo "Create Profile Response: $CREATE_RESPONSE"