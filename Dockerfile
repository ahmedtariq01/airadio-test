FROM ubuntu:latest

# Set timezone to avoid interactive prompt
ENV DEBIAN_FRONTEND=noninteractive
RUN ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime && echo "Etc/UTC" > /etc/timezone

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tzdata \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm \
    && rm -rf /var/lib/apt/lists/*


# Set working directory for frontend
WORKDIR /app/frontend

# Copy only package.json and package-lock.json first to leverage caching
COPY frontend/package*.json ./

# Install dependencies in the correct directory
RUN npm install && \
    npm install -D @types/wavesurfer.js@6.0.12 && \
    npm install react-beautiful-dnd && \
    npm install -D @types/react-beautiful-dnd

# Copy the entire frontend code after dependencies are installed
COPY frontend/ ./

# Disable ESLint and TypeScript checks during build
ENV NEXT_DISABLE_ESLINT=true
ENV NEXT_IGNORE_TYPE_CHECKING=true
ENV NEXT_PUBLIC_API_URL=http://airadio-test-production.up.railway.app:8000
ENV NODE_ENV=production

# Build the frontend (if it fails, it continues)
RUN npm run build

# Set working directory back to /app
WORKDIR /app

# Expose ports
EXPOSE 8000 3000

# Start services
CMD ["sh", "-c", "(cd /app/frontend && npm run start)"]

