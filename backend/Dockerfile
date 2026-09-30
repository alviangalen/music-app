# ==============================================================================
# Stage 1: Build stage (compile TypeScript)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies required for tsc)
RUN npm ci

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript in /app/dist
RUN npm run build

# ==============================================================================
# Stage 2: Production runtime stage (minimal footprint & non-root user)
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript output from the builder stage
COPY --from=builder --chown=node:node /app/dist ./dist

# Security best practice: switch to built-in non-root 'node' user
USER node

# Expose backend port
EXPOSE 5000

# Docker healthcheck instruction
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/healthz | grep -q "ok" || exit 1

# Start the Node.js application
CMD ["node", "dist/index.js"]