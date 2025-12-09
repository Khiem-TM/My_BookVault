#!/bin/bash

# MyBook Frontend Health Check Script
# Created: December 9, 2024

echo "🚀 MyBook Frontend Health Check"
echo "==============================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0

# Test function
run_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}Test $TOTAL_TESTS: $1${NC}"
    
    if eval "$2"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Change to client directory
cd "$(dirname "$0")/client" || {
    echo -e "${RED}❌ Cannot find client directory${NC}"
    exit 1
}

echo -e "\n${YELLOW}📁 Working Directory: $(pwd)${NC}"

# Test 1: Package.json exists
run_test "Package.json exists" "[ -f package.json ]"

# Test 2: Dependencies installed
run_test "Node modules exist" "[ -d node_modules ]"

# Test 3: TypeScript config
run_test "TypeScript config exists" "[ -f tsconfig.json ]"

# Test 4: Vite config
run_test "Vite config exists" "[ -f vite.config.ts ]"

# Test 5: Environment file
run_test "Environment file exists" "[ -f .env ]"

# Test 6: Source directory structure
run_test "Source directory structure" "[ -d src/features ] && [ -d src/services ] && [ -d src/store ] && [ -d src/utils ]"

# Test 7: Key source files exist
run_test "Key source files exist" "[ -f src/App.tsx ] && [ -f src/main.tsx ]"

# Test 8: Auth components exist
run_test "Auth components exist" "[ -f src/features/auth/Login.tsx ] && [ -f src/features/auth/Register.tsx ] && [ -f src/features/auth/AuthPage.tsx ]"

# Test 9: Services exist
run_test "Services exist" "[ -f src/services/authService.ts ] && [ -f src/services/apiServices.ts ] && [ -f src/utils/axiosConfig.ts ]"

# Test 10: Store exists
run_test "State store exists" "[ -f src/store/authStore.ts ]"

# Test 11: TypeScript types
run_test "TypeScript types installed" "[ -d node_modules/@types/react ]"

# Test 12: TypeScript check
run_test "TypeScript check passes" "npx tsc --noEmit --skipLibCheck"

# Test 13: Build test
run_test "Production build works" "npm run build > /dev/null 2>&1"

# Test 14: Built files exist
run_test "Built files exist" "[ -f dist/index.html ] && [ -d dist/assets ]"

# Test 15: Environment variables check
run_test "Environment variables configured" "grep -q 'VITE_API_BASE_URL' .env"

# Summary
echo -e "\n${YELLOW}📊 TEST SUMMARY${NC}"
echo "==============="
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED - Frontend is ready!${NC}"
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
    echo -e "${GREEN}✅ Production build successful${NC}"
    echo -e "${GREEN}✅ All components and services present${NC}"
    echo -e "${GREEN}✅ Dependencies correctly installed${NC}"
    
    echo -e "\n${BLUE}🚀 Ready to run:${NC}"
    echo -e "  Development: ${YELLOW}npm run dev${NC}"
    echo -e "  Production:  ${YELLOW}npm run build && npm run preview${NC}"
    
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the issues above.${NC}"
    exit 1
fi
