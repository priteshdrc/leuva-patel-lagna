# Leuva Patel Lagna: the site plus its small group-planning API in one image.
# Plain JavaScript on Node's built-in SQLite, so nothing is compiled: the arm64
# (Orange Pi) and amd64 images are built the same way in seconds.
FROM node:22-alpine

ENV NODE_ENV=production \
    NODE_NO_WARNINGS=1 \
    HOST=0.0.0.0 \
    PORT=8200 \
    DATA_DIR=/data

WORKDIR /app
COPY server/server.js server/db.js ./server/
COPY src/data-*.js ./src/
COPY docs/index.html ./docs/index.html

RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8200
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:8200/api/health >/dev/null || exit 1
CMD ["node", "server/server.js"]
