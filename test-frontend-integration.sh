#!/bin/bash

echo "🚀 MyBook Frontend Integration Testing Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    local endpoint=${3:-"/actuator/health"}
    
    echo -e "${BLUE}Checking ${service_name}...${NC}"
    
    if curl -s "http://localhost:${port}${endpoint}" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ${service_name} is healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ ${service_name} is not responding${NC}"
        return 1
    fi
}

# Check if Docker services are running
echo -e "\n${YELLOW}Step 1: Checking Docker Services${NC}"
echo "=================================="

if ! docker compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Docker services not running. Starting services...${NC}"
    docker compose up -d
    echo -e "${BLUE}Waiting 30 seconds for services to start...${NC}"
    sleep 30
fi

# Check backend services
echo -e "\n${YELLOW}Step 2: Backend Services Health Check${NC}"
echo "======================================"

services_healthy=0
total_services=0

# Core services to check
declare -A services=(
    ["API Gateway"]="8888"
    ["Identity Service"]="8080"
    ["Book Service"]="8086"
    ["Library Service"]="8088" 
    ["Order Service"]="8091"
    ["Profile Service"]="8081"
)

for service in "${!services[@]}"; do
    total_services=$((total_services + 1))
    if check_service "$service" "${services[$service]}"; then
        services_healthy=$((services_healthy + 1))
    fi
    sleep 1
done

echo -e "\n${BLUE}Backend Health Summary: ${services_healthy}/${total_services} services healthy${NC}"

if [ $services_healthy -lt $total_services ]; then
    echo -e "${YELLOW}⚠️ Some services are unhealthy, but continuing with frontend test...${NC}"
fi

# Check frontend build
echo -e "\n${YELLOW}Step 3: Frontend Build Verification${NC}"
echo "===================================="

cd client || exit 1

echo -e "${BLUE}Installing dependencies...${NC}"
npm install --silent

echo -e "${BLUE}Running TypeScript check...${NC}"
if npx tsc --noEmit --skipLibCheck; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    exit 1
fi

echo -e "${BLUE}Building frontend...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# Test API connectivity from frontend
echo -e "\n${YELLOW}Step 4: API Connectivity Test${NC}"
echo "=============================="

# Create a test script to check API endpoints
cat > test-api-connectivity.js << 'EOF'
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8888';

async function testEndpoint(endpoint, description) {
  try {
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      timeout: 5000,
      validateStatus: function (status) {
        return status < 500; // Accept any status less than 500 as success
      }
    });
    console.log(`✅ ${description}: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ ${description}: ${error.code || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('Testing API endpoints...\n');
  
  const tests = [
    ['/actuator/health', 'API Gateway Health'],
    ['/book-service/api/books', 'Books API'],
    ['/identity-service/api/auth/test', 'Auth API'],
    ['/library-service/api/library/test', 'Library API'],
    ['/order-service/api/orders/test', 'Orders API']
  ];
  
  let successful = 0;
  for (const [endpoint, description] of tests) {
    if (await testEndpoint(endpoint, description)) {
      successful++;
    }
  }
  
  console.log(`\nAPI Test Summary: ${successful}/${tests.length} endpoints accessible`);
  process.exit(successful === tests.length ? 0 : 1);
}

runTests();
EOF

# Run API connectivity test
if npm ls axios > /dev/null 2>&1 || npm install axios --silent; then
    echo -e "${BLUE}Testing API connectivity...${NC}"
    if node test-api-connectivity.js; then
        echo -e "${GREEN}✅ API connectivity successful${NC}"
    else
        echo -e "${YELLOW}⚠️ Some API endpoints not accessible${NC}"
    fi
    rm -f test-api-connectivity.js
else
    echo -e "${YELLOW}⚠️ Cannot test API connectivity (axios not available)${NC}"
fi

# Start development server
echo -e "\n${YELLOW}Step 5: Starting Development Server${NC}"
echo "==================================="

echo -e "${GREEN}🎉 Frontend Integration Test Complete!${NC}"
echo -e "${BLUE}Starting development server on http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}Available Pages:${NC}"
echo "• Home: http://localhost:5173/"
echo "• Books: http://localhost:5173/books"
echo "• Book Detail: http://localhost:5173/books/1"
echo "• Library: http://localhost:5173/library"
echo "• Profile: http://localhost:5173/profile"
echo "• Orders: http://localhost:5173/orders"
echo "• Genres: http://localhost:5173/genres"
echo ""
echo -e "${YELLOW}Features to Test:${NC}"
echo "• 🔍 Search functionality"
echo "• 📚 Book browsing and filtering"
echo "• ❤️ Library management (Wishlist, Reading, Read)"
echo "• 👤 Profile editing and statistics"
echo "• 📦 Order tracking and management"
echo "• 🎭 Genre exploration"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop the development server${NC}"
echo ""

# Start the dev server
npm run dev

echo -e "\n${BLUE}Development server stopped.${NC}"
echo -e "${GREEN}Frontend integration testing complete!${NC}"
