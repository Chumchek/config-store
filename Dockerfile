FROM node:22-alpine AS development

WORKDIR /app
COPY package*.json .
RUN npm ci
COPY src src
CMD ["npm", "run", "dev"]

FROM node:22-alpine AS production-dpndncs

WORKDIR /app
COPY package*.json .
RUN npm ci --only=production


FROM gcr.io/distroless/nodejs22 AS production
WORKDIR /app
COPY --from=production-dpndncs /app/node_modules node_modules
COPY src src

# ENTRYPOINT ["node"]
CMD ["src/index.js"]