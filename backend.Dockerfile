FROM node:24-slim AS build

WORKDIR /build/server
COPY server/package.json server/package-lock.json /build/server/

RUN npm install

COPY shared /build/shared
COPY server /build/server

RUN npm run build

FROM node:24-alpine AS run

WORKDIR /app
COPY server/package.json server/package-lock.json /app/
COPY --from=build /build/server/dist /app/dist

RUN npm install --omit=dev

RUN adduser -D nutripi
USER nutripi

CMD ["node", "dist/server/src/bin/www.js"]
