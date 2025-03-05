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
    netcat-traditional \
    postgresql-client \
    redis \
    tzdata \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm \
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

# Expose ports
EXPOSE 8000

# Start services
CMD ["sh", "-c", "service redis-server start && \
    (cd /app/backend && /app/venv/bin/python manage.py migrate && \
     /app/venv/bin/python manage.py collectstatic --noinput && \
     /app/venv/bin/uvicorn radiocms.asgi:application --host 0.0.0.0 --port 8000 --reload)"]




