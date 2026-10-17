# Root Dockerfile: redirects build to resource-app
FROM node:20-alpine AS builder

WORKDIR /app

COPY resource-app/package.json resource-app/package-lock.json ./
RUN npm ci

COPY resource-app/ ./
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY resource-app/package.json resource-app/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY resource-app/server.js ./

EXPOSE 8080

CMD ["node", "server.js"]
