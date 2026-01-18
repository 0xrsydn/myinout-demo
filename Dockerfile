# Stage 1: Build
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend
RUN bun run build

# Stage 2: Runtime
FROM oven/bun:1-slim

WORKDIR /app

# Copy package files and install production dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server source code
COPY src ./src
COPY scripts ./scripts
COPY tsconfig.json ./

# Copy seed data
COPY data/transactions.json ./data/

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Start script: seed if needed, then start server
CMD ["sh", "-c", "bun run seed && bun run src/server/index.ts"]
