FROM node:22-slim@sha256:a4b757cd491c7f0b57f57951f35f4e85b7e1ad54dbffca4cf9af0725e1650cd8 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim@sha256:a4b757cd491c7f0b57f57951f35f4e85b7e1ad54dbffca4cf9af0725e1650cd8 AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
