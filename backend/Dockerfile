# ================================
# Stage 1: Build Environment
# ================================
FROM python:3.12-slim AS builder

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Dhaka

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libffi-dev \
    libssl-dev \
    libjpeg-dev \
    zlib1g-dev \
    libpq-dev \
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt


# ================================
# Stage 2: Runtime Environment
# ================================
FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Dhaka

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    netcat-traditional \
    redis-server \
    supervisor \
    tzdata \
    ca-certificates \
    libpq5 \
    procps \
    && update-ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set timezone
RUN ln -fs /usr/share/zoneinfo/Asia/Dhaka /etc/localtime && dpkg-reconfigure --frontend noninteractive tzdata

# Create working directory
WORKDIR /app

# Copy wheels and install dependencies
COPY --from=builder /wheels /wheels
COPY requirements.txt /app/
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt || pip install --no-cache-dir psycopg2-binary

# Copy application files
COPY . /app

# Set up Supervisor
COPY supervisord.conf /etc/supervisor/supervisord.conf

# Add the entrypoint script and make it executable
RUN chmod +x /app/entrypoint.sh

# Entrypoint
ENTRYPOINT ["bash", "-c", "/app/entrypoint.sh"]
