# NEXA — container image (zero-dependency Node server: site + API)
FROM node:20-alpine
WORKDIR /app
COPY . .
# No production dependencies, but keep the step for forward-compatibility.
RUN npm install --omit=dev || true
ENV PORT=4000
EXPOSE 4000
CMD ["node", "server/server.js"]
