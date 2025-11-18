FROM node:20-slim AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y libreoffice-core libreoffice-common \
    libreoffice-writer libreoffice-draw \
    ghostscript && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY docker/package.json .
COPY docker/package-lock.json .
RUN npm install -g npm
RUN npm install

COPY . .

RUN node docx-to-html.js

WORKDIR /app/client
RUN npm install
RUN npm run build

FROM node:20-slim AS output

WORKDIR /output

COPY --from=builder /app/client/dist ./client/dist/

COPY --from=builder /app/server ./server/

COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/.env .  

