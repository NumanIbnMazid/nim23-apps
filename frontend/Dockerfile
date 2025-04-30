FROM node:22-alpine AS base

# Accept all needed public envs as build arguments
ARG MODE
ARG NEXT_PUBLIC_BACKEND_DOMAIN
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_BACKEND_BASE_URL
ARG NEXT_PUBLIC_BACKEND_API_BASE_URL
ARG BACKEND_API_TOKEN
ARG EMAIL_JS_SERVICE_ID
ARG EMAIL_JS_TEMPLATE_ID
ARG EMAIL_JS_COMMENT_TEMPLATE_ID
ARG EMAIL_JS_PUBLIC_KEY
ARG GA_MEASUREMENT_ID
ARG GA_PROPERTY_ID
ARG GA_PROJECT_ID
ARG GA_CLIENT_EMAIL
ARG GA_PRIVATE_KEY
ARG NEXT_PUBLIC_PORTFOLIO_URL
ARG HUMANIZER_AI_MAX_WORDS
ARG HUMANIZER_AI_MIN_WORDS

# Export them as ENV so Next.js can read them during build
ENV MODE=$MODE
ENV NEXT_PUBLIC_BACKEND_DOMAIN=$NEXT_PUBLIC_BACKEND_DOMAIN
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL
ENV NEXT_PUBLIC_BACKEND_API_BASE_URL=$NEXT_PUBLIC_BACKEND_API_BASE_URL
ENV BACKEND_API_TOKEN=$BACKEND_API_TOKEN
ENV EMAIL_JS_SERVICE_ID=$EMAIL_JS_SERVICE_ID
ENV EMAIL_JS_TEMPLATE_ID=$EMAIL_JS_TEMPLATE_ID
ENV EMAIL_JS_COMMENT_TEMPLATE_ID=$EMAIL_JS_COMMENT_TEMPLATE_ID
ENV EMAIL_JS_PUBLIC_KEY=$EMAIL_JS_PUBLIC_KEY
ENV GA_MEASUREMENT_ID=$GA_MEASUREMENT_ID
ENV GA_PROPERTY_ID=$GA_PROPERTY_ID
ENV GA_PROJECT_ID=$GA_PROJECT_ID
ENV GA_CLIENT_EMAIL=$GA_CLIENT_EMAIL
ENV GA_PRIVATE_KEY=$GA_PRIVATE_KEY
ENV NEXT_PUBLIC_PORTFOLIO_URL=$NEXT_PUBLIC_PORTFOLIO_URL
ENV HUMANIZER_AI_MAX_WORDS=$HUMANIZER_AI_MAX_WORDS
ENV HUMANIZER_AI_MIN_WORDS=$HUMANIZER_AI_MIN_WORDS

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
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
