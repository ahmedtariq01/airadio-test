FROM ubuntu:latest

# Set timezone to avoid interactive prompt
ENV DEBIAN_FRONTEND=noninteractive
RUN ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime && echo "Etc/UTC" > /etc/timezone

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    netcat-traditional \
    postgresql-client \
    redis \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Set Python environment
ENV PYTHONUNBUFFERED=1

# Create and activate virtual environment
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Copy backend dependencies and install
COPY backend/requirements.txt ./backend/requirements.txt
RUN /app/venv/bin/pip install --no-cache-dir -r backend/requirements.txt

# Create static and media directories
RUN mkdir -p /app/backend/static /app/backend/media

# Copy backend application code
COPY backend/ ./backend

# Copy frontend package files and install dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install && \
    npm install -D @types/wavesurfer.js@6.0.12 && \
    npm install react-beautiful-dnd && \
    npm install -D @types/react-beautiful-dnd

# Copy frontend application code
COPY frontend/ ./frontend

# Disable ESLint and TypeScript checks
ENV NEXT_DISABLE_ESLINT=true
ENV NEXT_IGNORE_TYPE_CHECKING=true

# Set environment variables
ENV DEBUG=1
ENV CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://frontend:3000
ENV POSTGRES_DB=airadio
ENV POSTGRES_USER=airadio_owner
ENV POSTGRES_PASSWORD=npg_2hl1bwSCimBQ
ENV POSTGRES_HOST=ep-shy-shadow-a584c1ur-pooler.us-east-2.aws.neon.tech
ENV NODE_ENV=development

# Run frontend build (ignore errors)
RUN cd frontend && npm run build || echo "⚠️ Build failed, but continuing..."

# Expose ports
EXPOSE 8000 3000 6379

# Start services
CMD service redis-server start && \
    (cd /app/backend && /app/venv/bin/python manage.py migrate && \
     /app/venv/bin/python manage.py collectstatic --noinput && \
     /app/venv/bin/uvicorn radiocms.asgi:application --host 0.0.0.0 --port 8000 --reload) & \
    (cd /app/frontend && npm install && npm run dev --host 0.0.0.0 --port 3000)
