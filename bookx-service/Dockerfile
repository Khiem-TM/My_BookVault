# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache curl && npm install --only=production

COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Start command
CMD ["npm", "start"]
