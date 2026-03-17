FROM node:24-slim AS build

WORKDIR /build/client

COPY client/package.json client/package-lock.json /build/client/
COPY shared /build/shared/

RUN npm install

COPY client /build/client/

RUN npm run build

FROM caddy/caddy:2.11.2-alpine AS run

ARG BACKEND_URL="nutripi-backend:3000"
ENV NUTRIPI_BACKEND=${BACKEND_URL}

COPY --from=build /build/client/dist /var/www/html

COPY Caddyfile /etc/caddy/Caddyfile
