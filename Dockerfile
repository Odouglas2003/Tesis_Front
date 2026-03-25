# ===========================================
# Next.js Multi-stage Dockerfile
# ===========================================

# Base image with Node.js
FROM node:24-alpine AS base
RUN npm i -g pnpm

# ===========================================
# Stage 1: Build
# ===========================================
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependencies
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

# Copy source code
COPY . .

RUN pnpm build

# ===========================================
# Stage 2: Production
# ===========================================
FROM base AS production
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built Next.js files
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# Start production server using standalone build
CMD ["node", "server.js"]