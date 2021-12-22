FROM postgis/postgis:14-3.1 AS base

FROM base AS development
COPY init.dev.sql /docker-entrypoint-initdb.d

FROM base AS production
COPY init.prod.sql /docker-entrypoint-initdb.d

EXPOSE 5432
