# syntax=docker/dockerfile:1

########## Stage 1: deps + prisma generate ##########
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

########## Stage 2: build ##########
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build
RUN npm run build

RUN [ -f dist/main.js ] || ( [ -f dist/src/main.js ] && cp dist/src/main.js dist/main.js ) || true

# ✅ Verify: chấp nhận 1 trong 2 đường dẫn
RUN ( [ -f dist/main.js ] || [ -f dist/src/main.js ] || (echo "❌ main.js NOT FOUND!"; find dist -maxdepth=3 -name 'main*.js' -print; exit 1) )
########## Stage 3: runtime ##########
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN apk add --no-cache tini curl

# LẤY node_modules đã generate từ deps rồi bỏ devDeps
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev

# Copy artifact build
COPY --from=builder /app/dist ./dist
# cần prisma để migrate/seed lúc runtime
COPY prisma ./prisma

# Verify lần nữa trong runtime image
RUN ( [ -f dist/main.js ] || [ -f dist/src/main.js ] || (echo "❌ main.js NOT FOUND!"; find dist -maxdepth 3 -name 'main*.js' -print; exit 1) )

# Non-root
RUN chown -R node:node /app
USER node

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD /bin/sh -c 'curl -fsS http://127.0.0.1:$PORT/health || exit 1'

ENTRYPOINT ["/sbin/tini","--"]
CMD ["node", "dist/main.js"]
