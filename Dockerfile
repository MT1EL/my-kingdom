# ------------------------------------------------------------------
# The API as a container — for Fly.io, Railway, a VPS, or anything else
# that runs images. Render uses render.yaml instead and does not need this.
#
# Build from the REPOSITORY ROOT, not from server/:
#   docker build -t mykingdom-api .
# The server's TypeScript project includes ../shared, so both directories
# have to be in the build context.
#
# Two paths must be mounted on a persistent volume, or every deploy loses
# them: /var/data/mykingdom.db and /var/data/uploads.
# ------------------------------------------------------------------

FROM node:22-slim AS build
WORKDIR /app

# Dependencies first, so a code change does not re-install everything.
COPY server/package.json server/package-lock.json server/
RUN npm --prefix server ci

COPY shared/ shared/
COPY server/ server/
RUN npm --prefix server run build


FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Production dependencies only — no TypeScript, no drizzle-kit.
COPY server/package.json server/package-lock.json server/
RUN npm --prefix server ci --omit=dev && npm cache clean --force

COPY --from=build /app/server/dist server/dist
# Migrations are read at boot, from disk — they are not compiled in.
COPY server/drizzle server/drizzle

# Defaults; a host that mounts its volume elsewhere overrides them.
ENV DATABASE_URL=file:/var/data/mykingdom.db
ENV UPLOAD_DIR=/var/data/uploads
ENV PORT=4000

EXPOSE 4000

# Run as the unprivileged user the base image already provides.
RUN mkdir -p /var/data && chown -R node:node /var/data
USER node

CMD ["node", "server/dist/server/src/index.js"]
