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
FROM nodebuilder AS petssitters-builder
COPY --chown=node:node ./package.json ./package-lock.json* ./
RUN npm ci && npm cache clean --force
COPY --chown=node:node ./ ./
RUN npm run build
USER node

# ================================================================================================================
FROM node:20-alpine AS petsitters
WORKDIR /usr/src/app
COPY --chown=node:node --from=petssitters-builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=petssitters-builder /usr/src/app/dist ./dist

CMD ["node", "dist/main.js"]