# ================================================================================================================
FROM node:20-alpine AS nodebuilder
WORKDIR /usr/src/app

# ================================================================================================================
FROM nodebuilder AS development
COPY --chown=node:node ./package.json ./package-lock.json* ./
RUN npm ci
COPY --chown=node:node ./ ./
USER node

# ================================================================================================================
FROM nodebuilder AS builder
COPY --chown=node:node ./package.json ./package-lock.json* ./
RUN npm ci && npm cache clean --force
COPY --chown=node:node ./ ./
RUN npm run build
USER node

# ================================================================================================================
FROM node:20-alpine AS production
WORKDIR /usr/src/app
COPY --chown=node:node --from=builder /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

USER node

CMD ["node", "dist/main.js"]