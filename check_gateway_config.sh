# Kiểm tra Gateway routes configuration
echo "🔍 Checking API Gateway Configuration"
echo "====================================="

# Check gateway application.yaml
echo "1. Gateway Routes Configuration:"
if [ -f "api-gateway/src/main/resources/application.yaml" ]; then
  cat api-gateway/src/main/resources/application.yaml | grep -A 20 -B 5 "profile"
else
  echo "Gateway config file not found!"
fi

echo ""
echo "2. Profile Service Configuration:"
if [ -f "profile-service/src/main/resources/application.yaml" ]; then
  cat profile-service/src/main/resources/application.yaml | grep -A 10 -B 5 "server\|port"
else
  echo "Profile service config not found!"
fi

echo ""
echo "3. Docker Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(profile|gateway)"