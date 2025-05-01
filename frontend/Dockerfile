FROM node:23-slim AS base

# Accept all needed public envs as build arguments
ARG NEXT_PUBLIC_MODE
ARG NEXT_PUBLIC_BACKEND_DOMAIN
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_BACKEND_BASE_URL
ARG NEXT_PUBLIC_BACKEND_API_BASE_URL
ARG SECRET_BACKEND_API_TOKEN
ARG NEXT_PUBLIC_EMAIL_JS_SERVICE_ID
ARG NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID
ARG NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY
ARG SECRET_GA_PROPERTY_ID
ARG SECRET_GA_PROJECT_ID
ARG SECRET_GA_CLIENT_EMAIL
ARG SECRET_GA_PRIVATE_KEY
ARG NEXT_PUBLIC_PORTFOLIO_SITE_URL
ARG NEXT_PUBLIC_HUMANIZER_AI_MAX_WORDS
ARG NEXT_PUBLIC_HUMANIZER_AI_MIN_WORDS
ARG NEXT_PUBLIC_YT_DLP_PATH

# Export them as ENV so Next.js can read them during build
ENV NEXT_PUBLIC_MODE=$NEXT_PUBLIC_MODE
ENV NEXT_PUBLIC_BACKEND_DOMAIN=$NEXT_PUBLIC_BACKEND_DOMAIN
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL
ENV NEXT_PUBLIC_BACKEND_API_BASE_URL=$NEXT_PUBLIC_BACKEND_API_BASE_URL
ENV SECRET_BACKEND_API_TOKEN=$SECRET_BACKEND_API_TOKEN
ENV NEXT_PUBLIC_EMAIL_JS_SERVICE_ID=$NEXT_PUBLIC_EMAIL_JS_SERVICE_ID
ENV NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID=$NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID
ENV NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY=$NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY
ENV SECRET_GA_PROPERTY_ID=$SECRET_GA_PROPERTY_ID
ENV SECRET_GA_PROJECT_ID=$SECRET_GA_PROJECT_ID
ENV SECRET_GA_CLIENT_EMAIL=$SECRET_GA_CLIENT_EMAIL
ENV SECRET_GA_PRIVATE_KEY=$SECRET_GA_PRIVATE_KEY
ENV NEXT_PUBLIC_PORTFOLIO_SITE_URL=$NEXT_PUBLIC_PORTFOLIO_SITE_URL
ENV NEXT_PUBLIC_HUMANIZER_AI_MAX_WORDS=$NEXT_PUBLIC_HUMANIZER_AI_MAX_WORDS
ENV NEXT_PUBLIC_HUMANIZER_AI_MIN_WORDS=$NEXT_PUBLIC_HUMANIZER_AI_MIN_WORDS
ENV NEXT_PUBLIC_YT_DLP_PATH=$NEXT_PUBLIC_YT_DLP_PATH

# Set environment variables
ENV PYTHONUNBUFFERED=1
# Set the environment variable to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Dhaka
ENV PYTHON_VERSION=3.12.2

# Install Dependencies
RUN apt update && \
    apt install -y --no-install-recommends \
    build-essential \
    gcc \
    musl-dev \
    libssl-dev \
    zlib1g-dev \
    curl \
    wget \
    ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python ${PYTHON_VERSION} from source (using --no-check-certificate for wget)
RUN wget --no-check-certificate https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tgz && \
tar xzf Python-${PYTHON_VERSION}.tgz && \
cd Python-${PYTHON_VERSION} && \
./configure --without-tests --enable-optimizations --enable-shared && \
make -j$(nproc) && \
make altinstall && \
ldconfig /usr/local/lib && \
cd .. && rm -rf Python-${PYTHON_VERSION}.tgz Python-${PYTHON_VERSION} && \
ln -s /usr/local/bin/python3.12 /usr/local/bin/python

# Set the Python executable path explicitly
ENV PYTHON="/usr/local/bin/python3.12" 

# Upgrade pip for Python
RUN $PYTHON -m ensurepip && \
$PYTHON -m pip install --no-cache --upgrade pip

# Install yt-dlp
RUN $PYTHON -m pip install yt-dlp

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Copy EntryPoint script
# COPY entrypoint.sh ./
# RUN chmod +x ./entrypoint.sh
# # COPY --chmod=755 frontend/entrypoint.sh /app/entrypoint.sh

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
# CMD ["ls", "-la", "/app"]
# ENTRYPOINT [ "sh", "-c", "/app/entrypoint.sh" ]
