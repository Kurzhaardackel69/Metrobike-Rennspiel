# Spiel + Multiplayer-Server für den Hetzner-Server (siehe HOSTING.md).
# Stufe 1 prüft: scheitern Syntaxprüfung oder Tests, entsteht kein Image und die laufende Fassung bleibt.
FROM node:22-alpine AS pruefung
WORKDIR /app
COPY multiplayer/package.json multiplayer/package-lock.json multiplayer/
RUN npm ci --prefix multiplayer --omit=dev
COPY package.json ./
COPY dist dist
COPY multiplayer/server.mjs multiplayer/
COPY tests tests
RUN npm run check && npm test

# Stufe 2 enthält nur, was der Server braucht (keine Tests, keine APK-Downloads, kein npm).
FROM node:22-alpine
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /opt/yarn* /usr/local/bin/yarn*
WORKDIR /app
COPY --from=pruefung /app/multiplayer multiplayer
COPY --from=pruefung /app/dist dist
COPY package.json ./
USER node
ENV PORT=8787
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:8787/health || exit 1
CMD ["node", "multiplayer/server.mjs", "--lan"]
