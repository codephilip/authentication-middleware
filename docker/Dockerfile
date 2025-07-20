FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# The logging-middleware will be mounted as a volume
# so we don't need to copy it here

# Copy source code
COPY src/ ./src/

# Create deps directory for volume mount
RUN mkdir -p /deps/logging-middleware

# Build the package (but allow it to fail since we'll mount the volume later)
RUN npm run build || true

# Expose port if needed for testing
EXPOSE 3000

# Add a healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1