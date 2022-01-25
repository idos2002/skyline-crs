FROM mongo:5.0.5 AS base

EXPOSE 27017

FROM base AS development
COPY init.dev.js /docker-entrypoint-initdb.d

FROM base AS production
COPY init.prod.js /docker-entrypoint-initdb.d

