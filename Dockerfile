# Use the official Bun image
FROM oven/bun:1.3-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY src ./src
COPY public ./public
COPY content ./content
COPY tsconfig.json ./

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Run the server
CMD ["bun", "run", "src/server.ts"]
