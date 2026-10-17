# ==========================================
# Stage 1: Build Vite Frontend
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy full source code
COPY . .

# Build production bundle to /app/dist
RUN npm run build

# ==========================================
# Stage 2: Production Server Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and server
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Expose both 8080 and 80 for Cloud Run
EXPOSE 8080 80

# Start server
CMD ["node", "server.js"]
