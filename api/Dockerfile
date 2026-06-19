FROM node:18-alpine

WORKDIR /app

# Copy manifests first so the npm layer is cached unless deps change.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

# Run as the unprivileged user that ships with the node image.
USER node

EXPOSE 3000

CMD ["node", "index.js"]
